/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, commands, workspace, window } from 'vscode';
import { join } from 'path';
import { homedir, } from 'os';
import { env } from 'process'
import { readFileSync, existsSync, writeFileSync, rmdirSync } from 'fs';
const yaml = require('js-yaml');
const YAML = require('yaml')

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
    if (sourcesDir === '') {
        sourcesDir = env.KRAFTKIT_PATHS_SOURCES ? env.KRAFTKIT_PATHS_SOURCES : ''
    }
    if (sourcesDir === '') {
        sourcesDir = getKraftkitConfigYAML().paths.sources
    }
    return sourcesDir;
}

export function getManifestsDir(): string {
    let manifestDir: string = workspace.getConfiguration()
        .get('unikraft.manifests', '');
    if (manifestDir === '') {
        manifestDir = env.KRAFTKIT_PATHS_MANIFESTS ? env.KRAFTKIT_PATHS_MANIFESTS : '';
    }
    if (manifestDir === '') {
        manifestDir = getKraftkitConfigYAML().paths.manifests;
    }
    return manifestDir;
}

export function getKraftYamlPath(projectPath: string): string | undefined {
    let kraftYamlPath = "";
    getDefaultFileNames().forEach(element => {
        let temPath = join(projectPath, element)
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
    let kraftYamlPath = getKraftYamlPath(projectPath)

    if (!kraftYamlPath) {
        return {}
    }

    return yaml.load(readFileSync(kraftYamlPath, 'utf-8'));
}

export function getKraftkitConfigYAML(): {
    paths: {
        sources: string,
        manifests: string
    }
} {
    return yaml.load(readFileSync(join(homedir(), '.config/kraftkit/config.yaml'), 'utf-8'))
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

    let kraftYamlPath = getKraftYamlPath(projectPath);
    if (!kraftYamlPath) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            "Kraftfile not found."
        );
        return;
    }
    let kraftYaml = getKraftYaml(projectPath);
    if (!kraftYaml["unikraft"]) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            "Unikraft core is already not present in the project."
        )
    } else {
        kraftYaml["unikraft"] = undefined;
    }
    writeFileSync(kraftYamlPath, YAML.stringify(kraftYaml));
    removeCoreProjectDir(kraftChannel, kraftStatusBarItem, projectPath);
}

export function showInfoMessage(kraftChannel: OutputChannel, kraftStatusBarItem: StatusBarItem, msg: string) {
    kraftStatusBarItem.text = msg;
    kraftChannel.appendLine(msg);
    // window.showInformationMessage(msg);
}

export function showErrorMessage(kraftChannel: OutputChannel, kraftStatusBarItem: StatusBarItem, msg: string) {
    kraftStatusBarItem.text = msg;
    kraftChannel.appendLine(msg);
    window.showErrorMessage(msg);
}
