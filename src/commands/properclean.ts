import { OutputChannel, StatusBarItem } from 'vscode';
import { Command } from './Command';
import { getProjectPath, showErrorMessage, showInfoMessage } from './utils';

export async function kraftProperclean(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    const projectPath = getProjectPath()
    if (!projectPath) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            "No workspace."
        )
    }
    kraftChannel.show(true);
    const command = new Command(
        `kraft clean --log-type=json --proper`,
        {
            cwd: projectPath,
            env: Object.assign(
                process.env)
        },
        'Cleaned properly',
        () => { }
    );

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Cleaning properly..."
    )

    command.execute(kraftChannel, kraftStatusBarItem);
}
