/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import { Command } from './Command';
import * as utils from './utils';

export async function kraftDeploy(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
): Promise<void> {
    kraftChannel.show(true)
    const projectPath = utils.getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Deploy error: No workspace.');
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
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Deploy error: No target chosen.');
        return;
    }

    const type = await window.showQuickPick(
        [
            'Deploy in interactive mode',
            'Deploy in non-interactive mode'
        ],
        { placeHolder: 'Configuration type' }
    );

    utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Deploying project..."
    );

    if (type === 'Deploy in non-interactive mode') {
        deployNonInteractively(kraftChannel, kraftStatusBarItem, projectPath);
    } else {
        deployInteractively(projectPath);
        kraftStatusBarItem.text = 'Unikraft';
    }
}

async function deployNonInteractively(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {

    // Get the variables from the environment
    let token = process.env.KRAFTCLOUD_TOKEN ? process.env.KRAFTCLOUD_TOKEN : "";
    let metro = process.env.KRAFTCLOUD_METRO ? process.env.KRAFTCLOUD_METRO : "";
    let user = process.env.KRAFTCLOUD_USER ? process.env.KRAFTCLOUD_USER : "";

    // If token is not set ask for it
    if (token === "") {
        let tokenCheck = await window.showInputBox({
            placeHolder: 'Enter your token',
            password: true,
            ignoreFocusOut: true
        });
        if (tokenCheck === undefined || tokenCheck === "") {
            return;
        } else {
            token = tokenCheck;
        }
    }

    // If metro is not set ask for it
    if (metro === "") {
        let metroCheck = await window.showInputBox({
            placeHolder: 'Enter your metro',
            ignoreFocusOut: true
        });
        if (metroCheck === undefined || metroCheck === "") {
            return;
        } else {
            metro = metroCheck;
        }
    }

    // If user is not set ask for it
    if (user === "") {
        let userCheck = await window.showInputBox({
            placeHolder: 'Enter your user',
            ignoreFocusOut: true
        });
        if (userCheck === undefined || userCheck === "") {
            return;
        } else {
            user = userCheck;
        }
    }

    const sourcesDir = utils.getSourcesDir();
    const manifestsDir = utils.getManifestsDir();
    const command = new Command(
        `kraft cloud deploy --log-type=basic ${getAllDeployArgs().trim()}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true,
                'KRAFTCLOUD_USER': user,
                'KRAFTCLOUD_TOKEN': token,
                'KRAFTCLOUD_METRO': metro
            }),
        },
        'Deployed project.',
        () => {
            kraftStatusBarItem.text = 'Unikraft';
        }
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Deploy project ${error}.`
        )
    }
}

async function deployInteractively(
    projectPath: string
) {
    const sourcesDir = utils.getSourcesDir();
    const manifestsDir = utils.getManifestsDir();

    // Get the variables from the environment
    let token = process.env.KRAFTCLOUD_TOKEN ? process.env.KRAFTCLOUD_TOKEN : "";
    let metro = process.env.KRAFTCLOUD_METRO ? process.env.KRAFTCLOUD_METRO : "";
    let user = process.env.KRAFTCLOUD_USER ? process.env.KRAFTCLOUD_USER : "";

    // If token is not set ask for it
    if (token === "") {
        let tokenCheck = await window.showInputBox({
            placeHolder: 'Enter your token',
            password: true,
            ignoreFocusOut: true
        });
        if (tokenCheck === undefined || tokenCheck === "") {
            return;
        } else {
            token = tokenCheck;
        }
    }

    // If metro is not set ask for it
    if (metro === "") {
        let metroCheck = await window.showInputBox({
            placeHolder: 'Enter your metro',
            ignoreFocusOut: true
        });
        if (metroCheck === undefined || metroCheck === "") {
            return;
        } else {
            metro = metroCheck;
        }
    }

    // If user is not set ask for it
    if (user === "") {
        let userCheck = await window.showInputBox({
            placeHolder: 'Enter your user',
            ignoreFocusOut: true
        });
        if (userCheck === undefined || userCheck === "") {
            return;
        } else {
            user = userCheck;
        }
    }

    const terminal = window.createTerminal({
        name: "kraft cloud deploy",
        cwd: projectPath,
        hideFromUser: false,
        env: Object.assign(process.env, {
            'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
            'KRAFTKIT_PATHS_SOURCES': sourcesDir,
            'KRAFTKIT_NO_CHECK_UPDATES': true,
            'KRAFTCLOUD_USER': user,
            'KRAFTCLOUD_TOKEN': token,
            'KRAFTCLOUD_METRO': metro
        })
    });
    terminal.show();
    terminal.sendText(`kraft cloud deploy ${getAllDeployArgs().trim()} 2> /tmp/err_kraft_deploy`);
}

function getAllDeployArgs(): string {
    let deployArgs: string = "";
    const config = workspace.getConfiguration().get('unikraft.deploy.config', "");
    if (config !== null && config !== "") {
        deployArgs += ' --config ' + config;
    }

    const jobs = workspace.getConfiguration().get('unikraft.deploy.jobs', 0);
    if (jobs > 0) {
        deployArgs += ' --jobs ' + jobs;
    }

    const dbg = workspace.getConfiguration().get('unikraft.deploy.dbg', false);
    if (dbg) {
        deployArgs += ' --dbg';
    }

    const noCache = workspace.getConfiguration().get('unikraft.deploy.noCache', false);
    if (noCache) {
        deployArgs += ' --no-cache';
    }

    const noConfigure = workspace.getConfiguration().get('unikraft.deploy.noConfigure', false);
    if (noConfigure) {
        deployArgs += ' --no-configure';
    }

    const noFast = workspace.getConfiguration().get('unikraft.deploy.noFast', false);
    if (noFast) {
        deployArgs += ' --no-fast';
    }

    const noFetch = workspace.getConfiguration().get('unikraft.deploy.noFetch', false);
    if (noFetch) {
        deployArgs += ' --no-fetch';
    }

    const forcePull = workspace.getConfiguration().get('unikraft.deploy.forcePull', false);
    if (forcePull) {
        deployArgs += ' --force-pull';
    }

    const noUpdate = workspace.getConfiguration().get('unikraft.deploy.noUpdate', false);
    if (noUpdate) {
        deployArgs += ' --no-update';
    }

    const buildLog = workspace.getConfiguration().get('unikraft.deploy.buildLog', "");
    if (buildLog !== null && buildLog !== "") {
        deployArgs += ' --build-log ' + buildLog;
    }

    const envs = workspace.getConfiguration().get('unikraft.deploy.envs', []);
    if (envs !== null) {
        envs.forEach((env: string) => {
            deployArgs += ' --env ' + env;
        });
    }

    const memory = workspace.getConfiguration().get('unikraft.deploy.memory', 64);
    if (memory !== null && memory >= 64) {
        deployArgs += ' --memory ' + memory;
    }

    const name = workspace.getConfiguration().get('unikraft.deploy.name', "");
    if (name !== null && name !== "") {
        deployArgs += ' --name ' + name;
    }

    const noStart = workspace.getConfiguration().get('unikraft.deploy.noStart', "");
    if (noStart) {
        deployArgs += ' --no-start ' + noStart;
    }

    const ports = workspace.getConfiguration().get('unikraft.deploy.ports', []);
    if (ports !== null) {
        ports.forEach((port: string) => {
            deployArgs += ' --port ' + port;
        });
    }

    const replicas = workspace.getConfiguration().get('unikraft.deploy.replicas', 0);
    if (replicas !== null && replicas >= 0) {
        deployArgs += ' --replicas ' + replicas;
    }

    const rootfs = workspace.getConfiguration().get('unikraft.deploy.rootfs', "");
    if (rootfs !== null && rootfs !== "") {
        deployArgs += ' --rootfs ' + rootfs;
    }

    const timeout = workspace.getConfiguration().get('unikraft.deploy.timeout', 10);
    if (timeout !== null && timeout >= 0) {
        deployArgs += ' --timeout ' + timeout;
    }

    const runtime = workspace.getConfiguration().get('unikraft.deploy.runtime', "");
    if (runtime !== null && runtime !== "") {
        deployArgs += ' --runtime ' + runtime;
    }

    const strategy = workspace.getConfiguration().get('unikraft.deploy.strategy', "prompt");
    if (strategy !== null && strategy !== "prompt") {
        deployArgs += ' --strategy ' + strategy;
    } else {
        deployArgs += ' --strategy prompt';
    }
    return deployArgs
}
