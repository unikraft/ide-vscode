/* SPDX-License-Identifier: BSD-3-Clause */

import { ConfigurationTarget, workspace } from "vscode";
import { getKraftYaml } from './../commands/utils';
import { join } from 'path';
import { getAllFiles, getKraftYamlLibs, getLibFiles } from "./utils";
import { provideDefaultConfigC } from '../config'
import { existsSync, readFileSync } from "fs";
import { KraftLibType, KconfigType } from "../types/types";

export async function reloadIncludes(projectPath?: string) {
    if (!projectPath) {
        return;
    }

    const projectUnikraft = join(projectPath, '.unikraft');
    let includeFiles = getAllFiles(join(projectUnikraft, 'unikraft'));

    if (projectPath) {
        const libPaths = getLibFiles(
            projectPath,
            join(projectUnikraft, 'libs')
        );
        libPaths.forEach(lib =>
            includeFiles = includeFiles.concat(getAllFiles(lib)));
    }

    await provideDefaultConfigC();
    const confC = workspace.getConfiguration().get("C_Cpp");
    confC["default"]["includePath"] = includeFiles;

    await workspace.getConfiguration().update(
        'C_Cpp',
        confC,
        ConfigurationTarget.Workspace
    );
}

export async function reloadConfig(projectPath: string, changedFile?: string) {
    if (!projectPath) {
        return;
    }

    const kraftConfig = getKraftYamlKConfig(projectPath);
    let config: string[] = [];
    if (changedFile) {
        const dotConfig = getDotConfig(projectPath, changedFile);
        config = kraftConfig.concat(dotConfig);
    } else {
        config = kraftConfig;
    }

    config = config
        .filter((def: string) => def.split('=')[1] === 'y')
        .map((def: string) => def.split('=')[0]);

    await provideDefaultConfigC();
    const confC = workspace.getConfiguration().get("C_Cpp");
    confC["default"]["defines"] = config;

    await workspace.getConfiguration().update(
        'C_Cpp',
        confC,
        ConfigurationTarget.Workspace
    );
}

export async function setupCSupport(projectPath?: string) {
    await workspace.getConfiguration().update(
        'C_Cpp.default.intelliSenseMode',
        'linux-gcc-x64',
        ConfigurationTarget.Workspace
    );

    await workspace.getConfiguration().update(
        'C_Cpp.default.compilerArgs',
        [
            '-nostdinc'
        ],
        ConfigurationTarget.Workspace
    );

    await workspace.getConfiguration().update(
        'C_Cpp.default.compilerPath',
        '/usr/bin/gcc',
        ConfigurationTarget.Workspace
    );

    reloadIncludes(projectPath);
}

function getKraftYamlKConfig(projectPath: string): string[] {
    const kraftYaml = getKraftYaml(projectPath)
    if (!kraftYaml) {
        return []
    }
    const uConfigs = typeof kraftYaml.unikraft !== 'undefined' &&
        typeof kraftYaml.unikraft["kconfig" as keyof KraftLibType] !== 'undefined' ?
        kraftYaml.unikraft["kconfig" as keyof KraftLibType] : [];
    let ukConfig: string[] = []
    if (typeof uConfigs[0] !== 'string') {
        ukConfig = Object.keys(uConfigs).map(key => {
            return `${key}=${uConfigs[key as keyof KconfigType]}`
        })
    } else {
        ukConfig = uConfigs;
    }

    const kraftLibs = getKraftYamlLibs(projectPath);
    let kraftLibsKconfig: string[] = [];
    if (kraftLibs.length > 0) {
        kraftLibsKconfig = kraftLibs.flatMap(
            (lib) => {
                if (Object.keys(kraftYaml.libraries[lib]).includes("kconfig")) {
                    const kconfig = kraftYaml.libraries[lib]["kconfig" as keyof KraftLibType];
                    if (typeof kconfig[0] !== 'string') {
                        return Object.keys(kconfig).map((key) => {
                            return `${key}=${kconfig[key]}`
                        })
                    }
                    return kconfig
                }
                return []
            }
        )
    }

    return kraftLibsKconfig.concat(ukConfig);
}

function getDotConfig(projectPath: string, changedFile: string): string[] {
    const configFile = join(projectPath, changedFile);
    if (!existsSync(configFile)) {
        return [];
    }

    const config = readFileSync(configFile, 'utf-8').split(/\r?\n/)
        .filter(line => line && !line.startsWith('#'));

    return config;
}
