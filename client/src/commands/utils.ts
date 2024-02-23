/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, commands, workspace, window } from 'vscode';
import { basename, join } from 'path';
import { homedir, } from 'os';
import { env } from 'process'
import { readFileSync, existsSync, writeFileSync, rmdirSync } from 'fs';
import { stringify as yamlStringify, parse as yamlParse } from 'yaml';
import { KraftYamlType, KraftTargetType, LibManifestType } from '../types/types';

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

export function getKraftYaml(projectPath: string): KraftYamlType | undefined {
    const kraftYamlPath = getKraftYamlPath(projectPath)

    if (!kraftYamlPath) {
        return
    }
    return yamlParse(readFileSync(kraftYamlPath, 'utf-8'));
}

export function getKraftkitConfigYAML(): {
    paths: {
        sources: string,
        manifests: string
    }
} {
    return yamlParse(readFileSync(join(homedir(), '.config/kraftkit/config.yaml'), 'utf-8'));
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
            "Removed unikraft core from workdir."
        )
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
    if (!kraftYaml) {
        return
    }
    if (!kraftYaml["unikraft"]) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            "Unikraft core alreay exist."
        )
    } else {
        kraftYaml["unikraft"] = undefined;
    }
    writeFileSync(kraftYamlPath, yamlStringify(kraftYaml));
    removeCoreProjectDir(kraftChannel, kraftStatusBarItem, projectPath);
}

export function showInfoMessage(kraftChannel: OutputChannel, kraftStatusBarItem: StatusBarItem, msg: string) {
    kraftStatusBarItem.text = msg;
    kraftChannel.appendLine(msg);
}

export function showErrorMessage(kraftChannel: OutputChannel, kraftStatusBarItem: StatusBarItem, msg: string) {
    kraftChannel.appendLine(msg);
    window.showErrorMessage(msg);
}

export function pkgExtractor(output: string): string {
    if (output.includes("[")) {
        return output.substring(output.indexOf("["));
    }
    return ""
}

export function getPkgManifest(libName: string): LibManifestType | null {
    const manifestsDir = getManifestsDir();
    let pkgPath: string = "";
    if (libName.toLowerCase() === 'unikraft') {
        pkgPath = join(manifestsDir, "unikraft.yaml");
    } else {
        const index = join(manifestsDir, "index.yaml");
        if (!existsSync(index)) {
            return null;
        }
        const indexFile = yamlParse(readFileSync(index, 'utf-8'));
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
    return yamlParse(readFileSync(pkgPath, 'utf-8'));
}

export function fetchTargetsFromKraftYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
): string[] | undefined {
    const kraftYaml = getKraftYaml(projectPath);
    if (kraftYaml?.targets == undefined || kraftYaml?.targets == null) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            'Kraftfile has no target specified.'
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
                    let plat: string = "";
                    let arch: string = "";

                    if (target.arch) {
                        arch = target.arch;
                    } else {
                        arch = target.architecture
                    }

                    if (target.plat) {
                        plat = target.plat;
                    } else {
                        plat = target.platform
                    }

                    if (plat && arch) {
                        ret = plat == "firecracker" ? `fc-${arch}` : `${plat}-${arch}`;
                    }
                }
                return ret;
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
            'No matching builds found.'
        );
        return;
    }

    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );

    return target;
}
