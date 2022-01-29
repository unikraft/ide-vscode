import { ConfigurationTarget, workspace } from "vscode";
import * as utils from './../commands/utils';
import { join } from 'path';
import { getAllFiles, getLibFiles } from "./utils";

export async function reloadIncludes(projectPath?: string) {
    var includeFiles = getAllFiles(join(utils.getUkWorkdir(), 'unikraft'));

    if (projectPath) {
        const libPaths = getLibFiles(
            projectPath,
            join(utils.getUkWorkdir(), 'libs'
        ));
        libPaths.forEach(lib =>
            includeFiles = includeFiles.concat(getAllFiles(lib)));
    }

    await workspace.getConfiguration().update(
        'C_Cpp.default.includePath',
        includeFiles,
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
