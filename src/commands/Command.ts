/* SPDX-License-Identifier: BSD-3-Clause */

import { exec } from "child_process";
import { OutputChannel, StatusBarItem, window } from "vscode";

export class Command {

	constructor(
		public readonly command: string,
		public readonly options: Object,
		public readonly message: string,
		public readonly callback?: Function
	) {}

	execute(
		channel: OutputChannel,
		kraftStatusBarItem: StatusBarItem,
		nextCommands?: Command[]
	) {
		channel.appendLine(`executing ${this.command}`);
		return exec(this.command, this.options,
				(error: any, stdout: any, stderr: any) => {
			channel.appendLine(`executed ${this.command}`);
			if (error) {
				channel.appendLine(`error: ${error}`);
			}
	
			if (stderr) {
				channel.appendLine(`stderr: ${stderr}`);
			}
	
			channel.appendLine(`stdout: ${stdout}`);
	
			kraftStatusBarItem.text = this.message;

			if (this.callback) {
				window.showInformationMessage(this.message);
				this.callback();
			}
	
			if (nextCommands) {
				nextCommands[0].execute(
					channel,
					kraftStatusBarItem,
					nextCommands.length != 1 ? nextCommands.slice(1) : undefined
				);
			}
		});
	}
}
