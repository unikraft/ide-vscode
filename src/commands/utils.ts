/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, commands, workspace, window } from 'vscode';
import { basename, join } from 'path';
import { homedir, } from 'os';
import { env } from 'process'
import { readFileSync, existsSync, writeFileSync, rmdirSync } from 'fs';
import { stringify as yamlStringify } from 'yaml';
import { load as yamlLoad } from 'js-yaml';
import { KraftTargetType } from '../types/types';

export function getProjectPath(): string | undefined {
    return (workspace.workspaceFolders
        && (workspace.workspaceFolders.length > 0))
        ? workspace.workspaceFolders[0].uri.fsPath : undefined;
}

export function getDefaultFileNames() {
    return [
        "kraft.yaml",
        "kraft.yml",
        "Kraftfile.yml",
        "Kraftfile.yaml",
        "Kraftfile",
    ]
}

export function getSourcesDir(): string {
    let sourcesDir: string = workspace.getConfiguration()
        .get('unikraft.sources', '');
    if (sourcesDir === '' || sourcesDir === null) {
        sourcesDir = env.KRAFTKIT_PATHS_SOURCES ? env.KRAFTKIT_PATHS_SOURCES : ''
    }
    if (sourcesDir === '' || sourcesDir === null) {
        sourcesDir = getKraftkitConfigYAML().paths.sources
    }
    return sourcesDir;
}

export function getManifestsDir(): string {
    let manifestDir: string = workspace.getConfiguration()
        .get('unikraft.manifests', '');
    if (manifestDir === '' || manifestDir === null) {
        manifestDir = env.KRAFTKIT_PATHS_MANIFESTS ? env.KRAFTKIT_PATHS_MANIFESTS : '';
    }
    if (manifestDir === '' || manifestDir === null) {
        manifestDir = getKraftkitConfigYAML().paths.manifests;
    }
    return manifestDir;
}

export function getKraftYamlPath(projectPath: string): string | undefined {
    let kraftYamlPath = "";
    getDefaultFileNames().forEach(element => {
        const temPath = join(projectPath, element)
        if (existsSync(temPath)) {
            kraftYamlPath = temPath
        }
    });
    if (kraftYamlPath == "") {
        return undefined
    }
    return kraftYamlPath;
}

export function getKraftYaml(projectPath: string): any {
    const kraftYamlPath = getKraftYamlPath(projectPath)

    if (!kraftYamlPath) {
        return null
    }

    return yamlLoad(readFileSync(kraftYamlPath, 'utf-8'));
}

export function getKraftkitConfigYAML(): {
    paths: {
        sources: string,
        manifests: string
    }
} {
    const ret: any = yamlLoad(readFileSync(join(homedir(), '.config/kraftkit/config.yaml'), 'utf-8'));
    return ret
}

export function refreshViews() {
    commands.executeCommand('externalLibraries.refreshEntry');
}

export function removeCoreProjectDir(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    if (existsSync(join(projectPath, '.unikraft', 'unikraft'))) {
        rmdirSync(join(projectPath, '.unikraft', 'unikraft'), { recursive: true });
        showInfoMessage(kraftChannel, kraftStatusBarItem,
            "Unikraft core has been removed from the project successfully."
        )
    } else {
        showErrorMessage(
            kraftChannel,
            kraftStatusBarItem,
            "Unikraft core is not present in the project."
        );
    }
}

export function removeCore(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    if (!projectPath) {
        showErrorMessage(
            kraftChannel,
            kraftStatusBarItem,
            "No workspace."
        );
        return;
    }

    const kraftYamlPath = getKraftYamlPath(projectPath);
    if (!kraftYamlPath) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            "Kraftfile not found."
        );
        return;
    }
    const kraftYaml = getKraftYaml(projectPath);
    if (!kraftYaml["unikraft"]) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            "Unikraft core is already not present in the project."
        )
    } else {
        kraftYaml["unikraft"] = '';
    }
    writeFileSync(kraftYamlPath, yamlStringify(kraftYaml));
    removeCoreProjectDir(kraftChannel, kraftStatusBarItem, projectPath);
}

export function showInfoMessage(kraftChannel: OutputChannel, kraftStatusBarItem: StatusBarItem, msg: string) {
    kraftStatusBarItem.text = msg;
    kraftChannel.appendLine(msg);
}

export function showErrorMessage(kraftChannel: OutputChannel, kraftStatusBarItem: StatusBarItem, msg: string) {
    kraftStatusBarItem.text = msg;
    kraftChannel.appendLine(msg);
    window.showErrorMessage(msg);
}

export function pkgExtractor(output: string): string {
    if (output.includes("[")) {
        return output.substring(output.indexOf("["));
    }
    return ""
}

export function getPkgManifest(libName: string): any {
    const manifestsDir = getManifestsDir();
    let pkgPath: string = "";
    if (libName.toLowerCase() === 'unikraft') {
        pkgPath = join(manifestsDir, "unikraft.yaml");
    } else {
        const index = join(manifestsDir, "index.yaml");
        if (!existsSync(index)) {
            return null;
        }
        const indexFile: any = yamlLoad(readFileSync(index, 'utf-8'));
        let libPath: string = "";
        indexFile.manifests.forEach((manifest: { manifest: string, name: string, type: string }) => {
            if (manifest.type == "lib" && manifest.name.toLowerCase() === libName.toLowerCase()) {
                libPath = manifest.manifest;
            }
        });
        if (libPath.length == 0) {
            return null
        }
        pkgPath = join(manifestsDir, libPath);
    }
    if (!existsSync(pkgPath)) {
        return null;
    }
    return yamlLoad(readFileSync(pkgPath, 'utf-8'));
}

export function fetchTargetsFromKraftYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
): string[] | undefined {
    const kraftYaml = getKraftYaml(projectPath);
    if (kraftYaml.targets == undefined || kraftYaml.targets == null) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            'no target found in Kraftfile'
        );
        return;
    }
    const targets: string[] = kraftYaml.targets
        .map(
            (target: KraftTargetType) => {
                let ret: string = "";
                if (typeof target == 'string') {
                    const tmp: string[] = target.split('/');
                    ret = tmp[0] == "firecracker" ? `fc-${tmp[1]}` : `${tmp[0]}-${tmp[1]}`;
                } else {
                    ret = target.platform == "firecracker" ? `fc-${target.architecture}` : `${target.platform}-${target.architecture}`;
                }
                return ret
            }
        );
    return targets;
}

export async function getTarget(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
): Promise<string | undefined> {
    let targets = fetchTargetsFromKraftYaml(
        kraftChannel,
        kraftStatusBarItem,
        projectPath
    );
    if (targets == undefined) {
        return
    }
    targets = targets.filter((target: string) => {
        const bname: string = basename(projectPath);
        let ret: boolean = existsSync(join(
            projectPath,
            '.unikraft',
            'build',
            `${bname}_${target}`
        ));
        if (!ret && bname.startsWith("app-")) {
            ret = existsSync(join(
                projectPath,
                '.unikraft',
                'build',
                `${bname.replace("app-", "")}_${target}`
            ));
        }
        return ret;
    });

    if (targets?.length == 0) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            'no matching builds found.'
        );
        return;
    }

    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );

    return target;
}
