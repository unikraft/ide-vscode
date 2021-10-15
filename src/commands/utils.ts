import { ConfigurationTarget, OutputChannel, commands, window, workspace } from 'vscode';

export function getProjectPath(): string | undefined {
    return (workspace.workspaceFolders
        && (workspace.workspaceFolders.length > 0))
    ? workspace.workspaceFolders[0].uri.fsPath : undefined;
}

export function getUkWorkdir(): string {
	return workspace.getConfiguration()
		.get('kraft.ukWorkdir', '');
}

export async function updateUkWorkdir(
    ukWorkdir: string,
    scope=ConfigurationTarget.Global
) {
    await workspace.getConfiguration().update(
        'kraft.ukWorkdir',
        ukWorkdir,
        scope
    );
}

export function getGithubToken(): string {
	return workspace.getConfiguration().get('kraft.githubToken', '');
}

export async function updateGithubToken(kraftChannel: OutputChannel)
: Promise<string> {
    var githubToken;
    
    while (!githubToken) {
        githubToken = await window.showInputBox({
            placeHolder: `Insert your Gihub token`,
        });
    }

    await workspace.getConfiguration().update(
        'kraft.githubToken',
        githubToken,
        ConfigurationTarget.Global
    );

    kraftChannel.appendLine('Edited the Github token.');

    return githubToken;
}

export function refreshViews() {
    commands.executeCommand('externalLibraries.refreshEntry');
}
