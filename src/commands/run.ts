/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import * as utils from './utils';

export async function kraftRun(
	kraftChannel: OutputChannel,
	kraftStatusBarItem: StatusBarItem,
) {
	kraftChannel.show(true);
	const projectPath = utils.getProjectPath();
	if (!projectPath) {
		utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Run error: no workspace.');
		return;
	}

	const target = await utils.getTarget(
		kraftChannel,
		kraftStatusBarItem,
		projectPath
	);
	if (!target) {
		return;
	}
	const splitTarget = target.split('-');

	const runArgs = `--plat ${splitTarget[0]} -m ${splitTarget[1]}` + getAllRunArgs();

	utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
		"Running project..."
	)
	try {
		const sourcesDir = utils.getSourcesDir();
		const manifestsDir = utils.getManifestsDir();
		const terminal = window.createTerminal({
			name: "kraft run --log-type=basic",
			cwd: projectPath,
			hideFromUser: false,
			env: Object.assign(process.env, {
				'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
				'KRAFTKIT_PATHS_SOURCES': sourcesDir,
				'KRAFTKIT_NO_CHECK_UPDATES': true
			})
		});

		terminal.show();
		terminal.sendText(`kraft run --log-type=basic ${runArgs}`);
	} catch (error) {
		utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
			`[Error] Run project ${error}.`
		)
	}
	kraftStatusBarItem.text = 'Unikraft';
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
	if (initrd !== null && initrd !== "") {
		runArgs += ' --initrd ' + initrd;
	}

	const ip = workspace.getConfiguration().get('unikraft.run.ip', "");
	if (ip !== null && ip !== "") {
		runArgs += ' --ip ' + ip;
	}

	const kernelArgs = workspace.getConfiguration().get('unikraft.run.kernelArguments', []);
	if (kernelArgs !== null && kernelArgs?.length > 0) {
		runArgs += ' --kernel-arg';
		kernelArgs.forEach(element => {
			runArgs += " " + element;
		});
	}

	const macAddress = workspace.getConfiguration().get('unikraft.run.macAddress', "");
	if (macAddress !== null && macAddress !== "") {
		runArgs += ' --mac ' + macAddress;
	}

	const memory = workspace.getConfiguration().get('unikraft.run.memory', "");
	if (memory !== null && memory !== "") {
		runArgs += ' -M ' + memory;
	}

	const name = workspace.getConfiguration().get('unikraft.run.name', "");
	if (name !== null && name !== "") {
		runArgs += ' --name ' + name;
	}

	const network = workspace.getConfiguration().get('unikraft.run.network', "");
	if (network !== null && network !== "") {
		runArgs += ' --network ' + network;
	}

	const ports = workspace.getConfiguration().get('unikraft.run.ports', []);
	if (ports?.length > 0) {
		runArgs += ' --port';
		ports.forEach(element => {
			runArgs += " " + element;
		});
	}

	const remove = workspace.getConfiguration().get('unikraft.run.remove', false);
	if (remove) {
		runArgs += ' --rm';
	}

	const as = workspace.getConfiguration().get('unikraft.run.as', "");
	if (as !== null && as !== "") {
		runArgs += ' --as ' + as;
	}

	const volume = workspace.getConfiguration().get('unikraft.run.volume', "");
	if (volume !== null && volume !== "") {
		runArgs += ' --volume ' + volume;
	}

	const symbolic = workspace.getConfiguration().get('unikraft.run.symbolic', false);
	if (symbolic) {
		runArgs += ' --symbolic';
	}

	return runArgs
}
