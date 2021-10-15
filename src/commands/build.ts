import { OutputChannel, StatusBarItem } from 'vscode';
import { Command } from './Command';
import { getProjectPath, getUkWorkdir } from './utils';

export async function kraftBuild(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
): Promise<void> {
    const projectPath = getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        return;
    }

    const command = new Command(
        'kraft build --no-progress',
        {
            cwd: projectPath,
            env: Object.assign(process.env, { 'UK_WORKDIR': getUkWorkdir() }),

        },
        'Built project.'
    );

    kraftStatusBarItem.text = 'Building project...';

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        kraftStatusBarItem.text = '[Error] Build project';
        kraftChannel.appendLine(`[Error] Build project ${error}.`);
    }
}
