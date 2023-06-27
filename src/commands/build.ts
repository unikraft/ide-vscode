/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window } from 'vscode';
import { Command } from './Command';
import { getProjectPath, getDefaultFileNames, showErrorMessage, getSourcesDir, getManifestsDir, getKraftYaml, showInfoMessage } from './utils';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const yaml = require('js-yaml');

export async function kraftBuild(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
): Promise<void> {
    kraftChannel.show(true)
    const projectPath = getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Build error: No workspace.');
        return;
    }

    const type = await window.showQuickPick(
        [
            'Build using interactive CLI',
            'Build from Kraftfile'
        ],
        { placeHolder: 'Configuration type' }
    );

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Building project..."
    )

    if (type === 'Build from Kraftfile') {
        buildFromYaml(kraftChannel, kraftStatusBarItem, projectPath);
    } else {
        configureInteractively(projectPath);
    }
}

async function buildFromYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    const kraftYaml = getKraftYaml(projectPath);
    if (kraftYaml.targets == undefined || kraftYaml.targets.length == 0) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Build error: No target found in Kraftfile.');
        return;
    }
    const targets = kraftYaml.targets.map((target: { architecture: any; platform: any; }) =>
        `${target.platform}-${target.architecture}`);
    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );
    if (!target) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Build error: No matching target.');
        return;
    }

    const splitTarget = target.split('-');

    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    const command = new Command(
        `kraft build -p ${splitTarget[0]} -m ${splitTarget[1]}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            }),
        },
        'Built project.'
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Build project ${error}.`
        )
    }
}

async function configureInteractively(projectPath: string) {
    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    let terminal = window.createTerminal({
        name: "kraft build",
        cwd: projectPath,
        hideFromUser: false,
        env: Object.assign(process.env, {
            'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
            'KRAFTKIT_PATHS_SOURCES': sourcesDir,
            'KRAFTKIT_NO_CHECK_UPDATES': true
        })
    });
    terminal.show();
    terminal.sendText('kraft build 2> /tmp/err_kraft_build');
}
