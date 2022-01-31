/* SPDX-License-Identifier: BSD-3-Clause */

import { ExtensionContext, OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import { existsSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import { getProjectPath, getUkWorkdir } from './utils';
import * as net from 'net';

const yaml = require('js-yaml');

export async function kraftRun(
	kraftChannel: OutputChannel,
	kraftStatusBarItem: StatusBarItem,
	context: ExtensionContext
) {
	const projectPath = getProjectPath();
	if (!projectPath) {
		kraftChannel.appendLine('No workspace.');
		return;
	}

	const target = await getTarget(kraftChannel, projectPath);
    if (!target) {
        return;
    }
	const splitTarget = target.split('-');

	const bridgeName = workspace.getConfiguration()
		.get('unikraft.bridge_name', 'virbr0');
	var runArgs = `-p ${splitTarget[0]} -m ${splitTarget[1]}`;

	const debug = workspace.getConfiguration().get('unikraft.debug', false);
	if (debug) {
		runArgs += ' -d';
	}

	const paused = workspace.getConfiguration().get('unikraft.paused', false);
	if (paused) {
		runArgs += ' -P';
	}

	const gdb = workspace.getConfiguration().get('unikraft.gdb', false);
	if (gdb) {
		runArgs += ' -g ';
		runArgs += workspace.getConfiguration().get('unikraft.gdb_port', 4123);
	}

	const ip = workspace.getConfiguration().get('unikraft.ip4', '172.44.0.2');
	const gateway_ip = workspace.getConfiguration()
		.get('unikraft.gateway_ip4', '172.44.0.1');
	const netmask = workspace.getConfiguration()
		.get('unikraft.netmask4', '255.255.255.0');

	const bridged = workspace.getConfiguration().get('unikraft.bridged', false);
	if (bridged) {
		if (!net.isIPv4(ip)) {
			window.showErrorMessage(`Invalid ip address ${ip}.`);
			return;
		}

		if (!net.isIPv4(gateway_ip)) {
			window.showErrorMessage(`Invalid gateway_ip address ${gateway_ip}.`);
			return;
		}

		if (!net.isIPv4(netmask)) {
			window.showErrorMessage(`Invalid netmask ${netmask}.`);
			return;
		}
	}

	kraftStatusBarItem.text = 'Running project...';

	const create_bridge = workspace.getConfiguration()
		.get('unikraft.create_bridge', false);		

	try {
		const terminal = window.createTerminal({
			name: "kraft run",
			cwd: projectPath,
			hideFromUser: false,
			shellPath: context.asAbsolutePath(join('src', 'scripts', 'run.sh')),
			shellArgs:
				create_bridge ? [runArgs, bridgeName, gateway_ip, netmask, ip, '1'] :
				bridged ? [runArgs, bridgeName, gateway_ip, netmask, ip] :
				[runArgs],
			env: Object.assign(process.env, { 'UK_WORKDIR': getUkWorkdir() })
		});

		terminal.show();
	} catch (error) {
		kraftStatusBarItem.text = '[Error] Run project';
		kraftChannel.appendLine(`[Error] Run project ${error}.`);
	}
}

async function getName(
    kraftChannel: OutputChannel,
    projectPath: string
): Promise<string | undefined> {
    const kraftYamlPath = join(projectPath, 'kraft.yaml');
    if (!existsSync(kraftYamlPath)) {
        kraftChannel.appendLine('No kraft.yaml');
        return;
    }

    const kraftYaml = yaml.load(readFileSync(kraftYamlPath, 'utf-8'));

	return kraftYaml.name;
}

async function getTarget(
    kraftChannel: OutputChannel,
    projectPath: string
): Promise<string | undefined> {
    const kraftYamlPath = join(projectPath, 'kraft.yaml');
    if (!existsSync(kraftYamlPath)) {
        kraftChannel.appendLine('No kraft.yaml');
        return;
    }

    const kraftYaml = yaml.load(readFileSync(kraftYamlPath, 'utf-8'));
	const targets = kraftYaml.targets
		.map((target: { architecture: any; platform: any; }) =>
			`${target.platform}-${target.architecture}`)
		.filter((target: string) =>
			existsSync(join(
				projectPath,
				'build',
				`${basename(projectPath)}_${target}`
			)
		)
	);

    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );
    
	return target;
}
