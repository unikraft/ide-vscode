/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { getProjectPath, getSourcesDir, getManifestsDir, getDefaultFileNames, showErrorMessage, getKraftYaml, showInfoMessage } from './utils';

const yaml = require('js-yaml');

export async function kraftRun(
	kraftChannel: OutputChannel,
	kraftStatusBarItem: StatusBarItem,
) {
	kraftChannel.show(true);
	const projectPath = getProjectPath();
	if (!projectPath) {
		showErrorMessage(kraftChannel, kraftStatusBarItem, 'Run error: no workspace.');
		return;
	}

	const target = await getTarget(kraftChannel, kraftStatusBarItem, projectPath);
	if (!target) {
		return;
	}
	const splitTarget = target.split('-');

	var runArgs = `--plat ${splitTarget[0]} -m ${splitTarget[1]}`;

	const symbolic = workspace.getConfiguration().get('unikraft.symbolic', false);
	if (symbolic) {
		runArgs += ' --symbolic';
	}

	const disableAccel = workspace.getConfiguration().get('unikraft.disableAccel', false);
	if (disableAccel) {
		runArgs += ' -W';
	}

	const detach = workspace.getConfiguration().get('unikraft.detach', false);
	if (detach) {
		runArgs += ' -d';
	}

	const remove = workspace.getConfiguration().get('unikraft.remove', false);
	if (remove) {
		runArgs += ' --rm';
	}

	const ip = workspace.getConfiguration().get('unikraft.ip', '');
	if (ip !== '') {
		runArgs += ' --ip ' + ip;
	}

	const network = workspace.getConfiguration().get('unikraft.network', '');
	if (network !== '') {
		runArgs += ' --network ' + network;
	}

	const memory = workspace.getConfiguration().get('unikraft.memory', '');
	if (memory !== '') {
		runArgs += ' -M ' + memory;
	}

	const ports = workspace.getConfiguration().get('unikraft.ports', []);
	if (ports.length > 0) {
		runArgs += ' --port';
		ports.forEach(element => {
			runArgs += " " + element;
		});
	}

	showInfoMessage(kraftChannel, kraftStatusBarItem,
		"Running project..."
	)
	try {
		let sourcesDir = getSourcesDir();
		let manifestsDir = getManifestsDir();
		const terminal = window.createTerminal({
			name: "kraft run",
			cwd: projectPath,
			hideFromUser: false,
			env: Object.assign(process.env, {
				'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
				'KRAFTKIT_PATHS_SOURCES': sourcesDir,
				'KRAFTKIT_NO_CHECK_UPDATES': true
			})
		});

		terminal.show();
		terminal.sendText(`kraft run ${runArgs}`);
	} catch (error) {
		showErrorMessage(kraftChannel, kraftStatusBarItem,
			`[Error] Run project ${error}.`
		)
	}
}

async function getTarget(
	kraftChannel: OutputChannel,
	kraftStatusBarItem: StatusBarItem,
	projectPath: string
): Promise<string | undefined> {
	const kraftYaml = getKraftYaml(projectPath);
	if (kraftYaml.targets == undefined || kraftYaml.targets.length == 0) {
		showErrorMessage(kraftChannel, kraftStatusBarItem,
			'Run error: no target found in Kraftfile'
		);
		return;
	}
	const targets: string[] = kraftYaml.targets
		.map((target: { architecture: any; platform: any; }) =>
			target.platform == "firecracker" ? `fc-${target.architecture}` : `${target.platform}-${target.architecture}`)
		.filter((target: string) =>
			existsSync(join(
				projectPath,
				'.unikraft',
				'build',
				`${basename(projectPath)}_${target}`
			)
			)
		);

	if (targets.length == 0) {
		showErrorMessage(kraftChannel, kraftStatusBarItem,
			'Run error: No matching builts found.'
		);
		return;
	}

	const target = await window.showQuickPick(
		targets,
		{ placeHolder: 'Choose the target' }
	);

	return target;
}
