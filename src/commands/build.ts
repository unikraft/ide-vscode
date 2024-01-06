/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import { Command } from './Command';
import * as utils from './utils';

export async function kraftBuild(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
): Promise<void> {
    kraftChannel.show(true)
    const projectPath = utils.getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Build error: No workspace.');
        return;
    }

    const targets = utils.fetchTargetsFromKraftYaml(
        kraftChannel,
        kraftStatusBarItem,
        projectPath
    );
    if (!targets) {
        return;
    }
    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );
    if (!target) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Build error: No target chosen.');
        return;
    }
    const splitTarget = target.split('-');

    const type = await window.showQuickPick(
        [
            'Build in interactive mode',
            'Build in non-interactive mode'
        ],
        { placeHolder: 'Configuration type' }
    );

    utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Building project..."
    );

    if (type === 'Build in non-interactive mode') {
        buildNonInteractively(kraftChannel, kraftStatusBarItem, splitTarget, projectPath);
    } else {
        buildInteractively(splitTarget, projectPath);
        kraftStatusBarItem.text = 'Unikraft';
    }
}

async function buildNonInteractively(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    splitTarget: string[],
    projectPath: string
) {
    const sourcesDir = utils.getSourcesDir();
    const manifestsDir = utils.getManifestsDir();
    const command = new Command(
        `kraft build --log-type=basic -p ${splitTarget[0]} -m ${splitTarget[1]} ${getAllBuildArgs().trim()}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            }),
        },
        'Built project.',
        () => {
            kraftStatusBarItem.text = 'Unikraft';
        }
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Build project ${error}.`
        )
    }
}

async function buildInteractively(splitTarget: string[], projectPath: string) {
    const sourcesDir = utils.getSourcesDir();
    const manifestsDir = utils.getManifestsDir();
    const terminal = window.createTerminal({
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
    terminal.sendText(`kraft build  -p ${splitTarget[0]} -m ${splitTarget[1]} ${getAllBuildArgs().trim()} 2> /tmp/err_kraft_build`);
}

function getAllBuildArgs(): string {
    let buildArgs: string = "";
    const config = workspace.getConfiguration().get('unikraft.build.config', "");
    if (config !== null && config !== "") {
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

    const forcePull = workspace.getConfiguration().get('unikraft.build.forcePull', false);
    if (forcePull) {
        buildArgs += ' --force-pull';
    }

    const noUpdate = workspace.getConfiguration().get('unikraft.build.noUpdate', false);
    if (noUpdate) {
        buildArgs += ' --no-update';
    }

    const buildLog = workspace.getConfiguration().get('unikraft.build.buildLog', "");
    if (buildLog !== null && buildLog !== "") {
        buildArgs += ' --build-log ' + buildLog;
    }
    return buildArgs
}
