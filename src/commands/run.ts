import { ExtensionContext, OutputChannel, StatusBarItem, window } from 'vscode';
import { join } from 'path';
import { getProjectPath } from './utils';

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

	kraftStatusBarItem.text = 'Running project...';

	try {
		const terminal = window.createTerminal({
			name: "kraft run",
			cwd: projectPath,
			hideFromUser: false,
			shellPath: context.asAbsolutePath(join('src', 'scripts', 'run.sh')),
		});

		terminal.show();
	} catch (error) {
		kraftStatusBarItem.text = '[Error] Run project';
		kraftChannel.appendLine(`[Error] Run project ${error}.`);
	}
}
