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

	let runArgs = `--plat ${splitTarget[0]} -m ${splitTarget[1]}` + getAllRunArgs();

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

function getAllRunArgs(): string {
	let runArgs: string = "";
	const detach = workspace.getConfiguration().get('unikraft.run.detach', false);
	if (detach) {
		runArgs += ' -d';
	}

	const disableAcceleration = workspace.getConfiguration().get('unikraft.run.disableAcceleration', false);
	if (disableAcceleration) {
		runArgs += ' -W';
	}

	const initrd = workspace.getConfiguration().get('unikraft.run.initrd', "");
	if (initrd !== '') {
		runArgs += ' --initrd ' + initrd;
	}

	const ip = workspace.getConfiguration().get('unikraft.run.ip', '');
	if (ip !== '') {
		runArgs += ' --ip ' + ip;
	}

	const kernelArgs = workspace.getConfiguration().get('unikraft.run.kernelArguments', []);
	if (kernelArgs.length > 0) {
		runArgs += ' --kernel-arg';
		kernelArgs.forEach(element => {
			runArgs += " " + element;
		});
	}

	const macAddress = workspace.getConfiguration().get('unikraft.run.macAddress', '');
	if (macAddress !== '') {
		runArgs += ' --mac ' + macAddress;
	}

	const memory = workspace.getConfiguration().get('unikraft.run.memory', '');
	if (memory !== '') {
		runArgs += ' -M ' + memory;
	}

	const name = workspace.getConfiguration().get('unikraft.run.name', '');
	if (name !== '') {
		runArgs += ' --name ' + name;
	}

	const network = workspace.getConfiguration().get('unikraft.run.network', '');
	if (network !== '') {
		runArgs += ' --network ' + network;
	}

	const ports = workspace.getConfiguration().get('unikraft.run.ports', []);
	if (ports.length > 0) {
		runArgs += ' --port';
		ports.forEach(element => {
			runArgs += " " + element;
		});
	}

	const remove = workspace.getConfiguration().get('unikraft.run.remove', false);
	if (remove) {
		runArgs += ' --rm';
	}

	const as = workspace.getConfiguration().get('unikraft.run.as', '');
	if (as !== '') {
		runArgs += ' --as ' + as;
	}

	const volume = workspace.getConfiguration().get('unikraft.run.volume', '');
	if (volume !== '') {
		runArgs += ' --volume ' + volume;
	}

	const symbolic = workspace.getConfiguration().get('unikraft.run.symbolic', false);
	if (symbolic) {
		runArgs += ' --symbolic';
	}

	return runArgs
}
