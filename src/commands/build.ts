/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import { Command } from './Command';
import { getProjectPath, showErrorMessage, getSourcesDir, getManifestsDir, getKraftYaml, showInfoMessage } from './utils';

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
        buildInteractively(projectPath);
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
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Build error: No target chose.');
        return;
    }

    const splitTarget = target.split('-');

    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    const command = new Command(
        `kraft build -p ${splitTarget[0]} -m ${splitTarget[1]} ${getAllBuildArgs().trim()}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            }),
        },
        'Built project.',
        () => { }
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Build project ${error}.`
        )
    }
}

async function buildInteractively(projectPath: string) {
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
    terminal.sendText(`kraft build ${getAllBuildArgs().trim()} 2> /tmp/err_kraft_build`);
}

function getAllBuildArgs(): string {
    let buildArgs: string = "";
    const config = workspace.getConfiguration().get('unikraft.build.config', "");
    if (config !== "") {
        buildArgs += ' --config ' + config;
    }

    const jobs = workspace.getConfiguration().get('unikraft.build.jobs', 0);
    if (jobs > 0) {
        buildArgs += ' --jobs ' + jobs;
    }

    const dbg = workspace.getConfiguration().get('unikraft.build.dbg', false);
    if (dbg) {
        buildArgs += ' --dbg';
    }

    const noCache = workspace.getConfiguration().get('unikraft.build.noCache', false);
    if (noCache) {
        buildArgs += ' --no-cache';
    }

    const noConfigure = workspace.getConfiguration().get('unikraft.build.noConfigure', false);
    if (noConfigure) {
        buildArgs += ' --no-configure';
    }

    const noFast = workspace.getConfiguration().get('unikraft.build.noFast', false);
    if (noFast) {
        buildArgs += ' --no-fast';
    }

    const noFetch = workspace.getConfiguration().get('unikraft.build.noFetch', false);
    if (noFetch) {
        buildArgs += ' --no-fetch';
    }

    const noPull = workspace.getConfiguration().get('unikraft.build.noPull', false);
    if (noPull) {
        buildArgs += ' --no-pull';
    }

    const noUpdate = workspace.getConfiguration().get('unikraft.build.noUpdate', false);
    if (noUpdate) {
        buildArgs += ' --no-update';
    }

    const buildLog = workspace.getConfiguration().get('unikraft.build.buildLog', '');
    if (buildLog !== "") {
        buildArgs += ' --build-log ' + buildLog;
    }
    return buildArgs
}
