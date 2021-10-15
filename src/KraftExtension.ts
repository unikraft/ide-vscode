import * as vscode from 'vscode';
import * as utils from './commands/utils';
import { ExternalLibrariesProvider, Library } from './ExternalLibrariesProvider';
import { kraftInitialize } from './commands/initialize';
import { kraftConfigure } from './commands/configure';
import { kraftBuild } from './commands/build';
import { kraftRun } from './commands/run';
import { kraftUpdate } from './commands/update';
import { execSync } from 'child_process';

import { env } from 'process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export class KraftExtension {

	constructor(private context: vscode.ExtensionContext) {}

	private kraftChannel = vscode.window.createOutputChannel(' Log (Kraft)');
	private kraftStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    private externalLibrariesProvider = new ExternalLibrariesProvider(
        utils.getProjectPath(),
        utils.getUkWorkdir()
    );

	async activate() {
        const externalLibrariesTreeView = vscode.window.registerTreeDataProvider(
            'externalLibraries',
            this.externalLibrariesProvider
        );

        this.context.subscriptions.push(externalLibrariesTreeView);
        this.context.subscriptions.push(this.kraftStatusBarItem);
        this.kraftStatusBarItem.show();
    
        await this.setupExtension();
        this.registerCommands();
    
        vscode.window.onDidCloseTerminal(t => {
            if (t.exitStatus) {
                if (t.name === 'kraft run') {
                    this.kraftStatusBarItem.text = 'Done running project.';
                } else if (t.name === 'kraft configure') {
                    this.kraftStatusBarItem.text = 'Done configuring project.';
                }
    
                if (!t.exitStatus.code) {
                    return;
                }
    
                this.kraftChannel.appendLine(
                    `${t.name} exit code: ${t.exitStatus.code}`
                );
            }
        });

        this.kraftStatusBarItem.text = 'Kraft';
        vscode.window.showInformationMessage(
            'Congratulations, your extension "kraft" is now active!'
        );
    }

    private async setupExtension() {
        var githubToken = utils.getGithubToken();
    
        if (githubToken === '') {
            this.kraftStatusBarItem.text = 'Waiting for the Github Token...';
            githubToken = await utils.updateGithubToken(this.kraftChannel);
        }
    
        if (utils.getUkWorkdir() === '') {
            utils.updateUkWorkdir(path.join(os.homedir(), '.unikraft'));
        }
    
        if (!fs.existsSync(path.join(os.homedir(), '.kraftrc'))) {
            this.installKraft(githubToken);
        }
    }

    private installKraft(githubToken: string) {
        const terminal = vscode.window.createTerminal(`Kraft setup`);

        this.kraftStatusBarItem.text = 'Installing kraft...';

        this.kraftChannel.appendLine('Installing dependencies...');
        terminal.sendText('sudo apt-get install -y --no-install-recommends \
            build-essential libncurses-dev libyaml-dev flex git wget bison \
            unzip uuid-runtime');
        this.kraftChannel.appendLine('Installed dependencies.');

        this.kraftChannel.appendLine('Installing kraft...');
        this.kraftChannel.appendLine(
            execSync(
                'pip install git+https://github.com/unikraft/kraft.git',
                { env: env }
            ).toString()
        );
        this.kraftChannel.appendLine('Installed kraft.');
        this.kraftChannel.appendLine('Executing "kraft list update"...');
        this.kraftChannel.appendLine(execSync(
                'kraft list update',
                {
                    env: Object.assign(
                        process.env,
                        { 'UK_KRAFT_GITHUB_TOKEN': githubToken })
                }
            ).toString()
        );
        this.kraftChannel.appendLine('Executed "kraft list update".');
    }

    private registerCommands() {
        const initializeCommand = vscode.commands.registerCommand(
            'kraft.initialize',
            async () => {
                kraftInitialize(this.kraftChannel, this.kraftStatusBarItem);
                this.externalLibrariesProvider.ukWorkdir = utils.getUkWorkdir();
        });
        const configureCommand = vscode.commands.registerCommand(
            'kraft.configure',
            async () => kraftConfigure(
                    this.kraftChannel,
                    this.kraftStatusBarItem,
                    this.context
                )
        );
        const buildCommand = vscode.commands.registerCommand(
            'kraft.build',
            async () => kraftBuild(this.kraftChannel,this.kraftStatusBarItem)
        );
        const runCommand = vscode.commands.registerCommand(
            'kraft.run',
            async () => kraftRun(
                this.kraftChannel,
                this.kraftStatusBarItem,
                this.context
            )
        );
        const updateCommand = vscode.commands.registerCommand(
            'kraft.update',
            async () => kraftUpdate(this.kraftChannel, this.kraftStatusBarItem)
        );
        const editTokenCommand = vscode.commands.registerCommand(
            'kraft.editToken',
            async () => utils.updateGithubToken(this.kraftChannel)
        );

        const addLibraryCommand = vscode.commands.registerCommand(
            'externalLibraries.addLibrary',
            () => this.externalLibrariesProvider.addLibrary(
                    this.kraftChannel,
                    this.kraftStatusBarItem
                )
        );
        const removeLibraryCommand = vscode.commands.registerCommand(
            'externalLibraries.removeLibrary',
            (node: Library) =>	
                node.removeLibrary(this.kraftChannel, this.kraftStatusBarItem)
        );
        const purgeLibraryCommand = vscode.commands.registerCommand(
            'externalLibraries.purgeLibrary',
            (node: Library) =>	
                node.removeLibrary(this.kraftChannel, this.kraftStatusBarItem, true)
        );
        const refreshLibraryCommand = vscode.commands.registerCommand(
            'externalLibraries.refreshEntry',
            () => this.externalLibrariesProvider.refresh()
        );

        this.kraftStatusBarItem.text = 'Registering commands...';
        this.kraftChannel.appendLine('Registering commands...');
        this.context.subscriptions.push(initializeCommand);
        this.context.subscriptions.push(configureCommand);
        this.context.subscriptions.push(buildCommand);
        this.context.subscriptions.push(runCommand);
        this.context.subscriptions.push(updateCommand);
        this.context.subscriptions.push(editTokenCommand);
        this.context.subscriptions.push(addLibraryCommand);
        this.context.subscriptions.push(removeLibraryCommand);
        this.context.subscriptions.push(purgeLibraryCommand);
        this.context.subscriptions.push(refreshLibraryCommand);
        this.kraftChannel.appendLine('Done registering commands.');
    }
}
