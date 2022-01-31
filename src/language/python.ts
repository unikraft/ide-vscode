/* SPDX-License-Identifier: BSD-3-Clause */

import { ConfigurationTarget, workspace } from "vscode";
import { join } from 'path';
import { existsSync, readdirSync, writeFile } from "fs";
import { getKraftYamlLibs } from "./utils";

export async function setupPythonSupport(projectPath?: string) {
    if (!projectPath) {
        return;
    }

    const kraftLibs = getKraftYamlLibs(projectPath);
    if (!kraftLibs.includes('python3')) {
        return;
    }

    const originPath = join(projectPath, 'build', 'libpython3', 'origin');
    if (!existsSync(originPath)) {
        return;
    }

    const pythonPath = readdirSync(originPath)
        .filter(f => f.startsWith('Python-'));
    if (!pythonPath) {
        return;
    }

    const pythonLibPath = join(originPath, pythonPath[0], 'Lib');

    writeFile(
        join(projectPath, '.env'),
        `PYTHONPATH=${pythonLibPath}`,
        function(err) {
            if (err) {
                return console.error(err);
            }
        }
    );

    await workspace.getConfiguration().update(
        'python.defaultInterpreterPath',
        pythonLibPath,
        ConfigurationTarget.Workspace
    );
}
