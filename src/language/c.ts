/* SPDX-License-Identifier: BSD-3-Clause */

import { ConfigurationTarget, workspace } from "vscode";
import * as utils from './../commands/utils';
import { join } from 'path';
import { getAllFiles, getLibFiles } from "./utils";
import { existsSync, readFileSync } from "fs";

const yaml = require('js-yaml');

export async function reloadIncludes(projectPath?: string) {
    if (!projectPath) {
        return;
    }

    const projectUnikraft = join(projectPath, '.unikraft')
    var includeFiles = getAllFiles(join(projectUnikraft, 'unikraft'));

    if (projectPath) {
        const libPaths = getLibFiles(
            projectPath,
            join(projectUnikraft, 'libs')
        );
        libPaths.forEach(lib =>
            includeFiles = includeFiles.concat(getAllFiles(lib)));
    }

    await workspace.getConfiguration().update(
        'C_Cpp.default.includePath',
        includeFiles,
        ConfigurationTarget.Workspace
    );
}

export async function reloadConfig(projectPath?: string) {
    if (!projectPath) {
        return;
    }

    const kraftConfig = getKraftYamlConfig(projectPath);
    const dotConfig = getDotConfig(projectPath);

    const config = kraftConfig.concat(dotConfig)
        .filter((def: string) => def.split('=')[1] === 'y')
        .map((def: string) => def.split('=')[0]);

    await workspace.getConfiguration().update(
        'C_Cpp.default.defines',
        config,
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

function getKraftYamlConfig(projectPath: string): string[] {
    let kraftYamlPath = "";
    utils.getDefaultFileNames().forEach(element => {
        let temPath = join(projectPath, element)
        if (existsSync(temPath)) {
            kraftYamlPath = temPath
        }
    });
    const kraftYaml = yaml.load(
        readFileSync(kraftYamlPath, 'utf-8'));

    const ukConfig = Object.keys(kraftYaml).includes('unikraft')
        && Object.keys(kraftYaml.unikraft).includes('kconfig') ?
        kraftYaml.unikraft.kconfig :
        [];

    const kraftLibs = Object.keys(kraftYaml).includes('libraries') ?
        Object.keys(kraftYaml.libraries).flatMap(lib =>
            Object.keys(kraftYaml.libraries[lib]).includes('kconfig') ?
                kraftYaml.libraries[lib].kconfig :
                []) :
        [];

    return kraftLibs.concat(ukConfig);
}

function getDotConfig(projectPath: string): string[] {
    const configFile = join(projectPath, '.config');
    if (!existsSync(configFile)) {
        return [];
    }

    const config = readFileSync(configFile, 'utf-8').split(/\r?\n/)
        .filter(line => line && !line.startsWith('#'));

    return config;
}
