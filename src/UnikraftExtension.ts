/* SPDX-License-Identifier: BSD-3-Clause */

import * as vscode from 'vscode';
import { getProjectPath, getSourcesDir, getManifestsDir, showErrorMessage, getDefaultFileNames } from './commands/utils';
import { reloadConfig, reloadIncludes } from './language/c';
import { setupPythonSupport } from './language/python';
import { ExternalLibrariesProvider, Library } from './ExternalLibrariesProvider';
import { kraftInitialize } from './commands/initialize';
import { kraftConfigure } from './commands/configure';
import { kraftBuild } from './commands/build';
import { kraftRun } from './commands/run';
import { kraftUpdate } from './commands/update';
import { kraftClean } from './commands/clean';
import { kraftProperclean } from './commands/properclean'
import { kraftFetch } from './commands/fetch'
import { kraftPrepare } from './commands/prepare';

import { execSync } from 'child_process';
import { env } from 'process';
import { basename } from 'path';
import { existsSync, readFileSync, rmSync } from 'fs';

const commandExistsSync = require('command-exists').sync;

export class UnikraftExtension {
    constructor(private context: vscode.ExtensionContext) { }

    private kraftChannel = vscode.window.createOutputChannel(' Log (Unikraft)');
    private kraftStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );
    private externalLibrariesProvider = new ExternalLibrariesProvider(
        getProjectPath(),
        getSourcesDir(),
        getManifestsDir()
    );

    async activate() {
        this.kraftChannel.show(true)
        await this.setupExtension();
    }

    private postSetup() {
        const externalLibrariesTreeView = vscode.window.registerTreeDataProvider(
            'externalLibraries',
            this.externalLibrariesProvider
        );

        this.context.subscriptions.push(externalLibrariesTreeView);
        this.context.subscriptions.push(this.kraftStatusBarItem);
        this.kraftStatusBarItem.show();


        vscode.window.onDidCloseTerminal(t => {
            if (t.exitStatus) {
                if (t.name === 'Kraft setup') {
                    this.kraftChannel.appendLine('Installed kraft.');
                    this.kraftStatusBarItem.text = 'Installed kraft.';
                    this.kraftChannel.appendLine('Executing "kraft pkg update"...');
                    this.kraftChannel.appendLine(execSync(
                        'kraft pkg update',
                        { env: env }
                    ).toString()
                    );
                    this.kraftChannel.appendLine('Executed "kraft pkg update".');
                    this.initExtension()
                }

                if (t.name === 'kraft run') {
                    this.kraftStatusBarItem.text = 'Done running project.';
                } else if (t.name === 'kraft menuconfig') {
                    this.kraftStatusBarItem.text = 'Done configuring project.';

                    const errFile = '/tmp/err_kraft_configure';
                    if (existsSync(errFile)) {
                        vscode.window.showErrorMessage(readFileSync(errFile).toString());

                        rmSync(errFile);
                    }
                }

                if (!t.exitStatus.code) {
                    return;
                }

                this.kraftChannel.appendLine(
                    `${t.name} exit code: ${t.exitStatus.code}`
                );
            }
        });

        vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
            let isKraftfile: boolean = false;
            let fileName: string = basename(document.fileName);
            const projectPath = getProjectPath();
            if (!projectPath) {
                return
            }
            getDefaultFileNames().forEach(file => {
                if (file === fileName) {
                    isKraftfile = true;
                }
            })

            if (isKraftfile) {
                setupPythonSupport(projectPath);
                reloadIncludes(projectPath);
                reloadConfig(projectPath);
            }

            if (fileName.startsWith('.config')) {
                reloadConfig(projectPath, fileName);
            }
        });
    }

    private initExtension() {
        this.registerCommands();
        this.kraftStatusBarItem.text = 'Unikraft';
        vscode.window.showInformationMessage(
            'Congratulations, your extension "Unikraft" is now active!'
        );
    }

    private async setupExtension() {
        if (!commandExistsSync('kraft')) {
            vscode.window.showInformationMessage('Do you want to install Kraftkit ?', "Install", "Cancel")
                .then((result) => {
                    if (result == "Install") {
                        this.installKraft();
                        this.postSetup()
                    } else {
                        showErrorMessage(this.kraftChannel,
                            this.kraftStatusBarItem,
                            "Kraftkit is not installed on the system."
                        )
                    }
                });
        } else {
            this.initExtension();
            this.postSetup()
        }
    }

    private installKraft() {
        const terminal = vscode.window.createTerminal(`Kraft setup`);

        this.kraftStatusBarItem.text = 'Installing kraft...';
        this.kraftChannel.appendLine('Installing kraft...');
        terminal.sendText(`sudo apt-get install -y --no-install-recommends build-essential \
        libncurses-dev \
        libyaml-dev \
        flex \
        wget \
        socat \
        bison \
        unzip \
        uuid-runtime \
        python3 \
        python3-setuptools \
        python3-pip \
        qemu-kvm \
        qemu-system-x86 \
        qemu-system-arm \
        sgabios \
        curl && curl --proto '=https' --tlsv1.2 -sSf https://get.kraftkit.sh | sh && exit`);
    }

    private registerCommands() {
        const initializeCommand = vscode.commands.registerCommand(
            'unikraft.initialize',
            async () => {
                kraftInitialize(this.kraftChannel, this.kraftStatusBarItem);
            });
        const configureCommand = vscode.commands.registerCommand(
            'unikraft.configure',
            async () => kraftConfigure(
                this.kraftChannel,
                this.kraftStatusBarItem)
        );
        const buildCommand = vscode.commands.registerCommand(
            'unikraft.build',
            async () => kraftBuild(this.kraftChannel, this.kraftStatusBarItem)
        );
        const runCommand = vscode.commands.registerCommand(
            'unikraft.run',
            async () => kraftRun(
                this.kraftChannel,
                this.kraftStatusBarItem,
            )
        );
        const updateCommand = vscode.commands.registerCommand(
            'unikraft.update',
            async () => kraftUpdate(this.kraftChannel, this.kraftStatusBarItem)
        );
        const cleanCommand = vscode.commands.registerCommand(
            'unikraft.clean',
            async () => kraftClean(this.kraftChannel, this.kraftStatusBarItem)
        );
        const propercleanCommand = vscode.commands.registerCommand(
            'unikraft.properclean',
            async () => kraftProperclean(this.kraftChannel, this.kraftStatusBarItem)
        );
        const fetchCommand = vscode.commands.registerCommand(
            'unikraft.fetch',
            async () => kraftFetch(this.kraftChannel, this.kraftStatusBarItem)
        );
        const prepareCommand = vscode.commands.registerCommand(
            'unikraft.prepare',
            async () => kraftPrepare(this.kraftChannel, this.kraftStatusBarItem)
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
        this.context.subscriptions.push(cleanCommand);
        this.context.subscriptions.push(propercleanCommand);
        this.context.subscriptions.push(fetchCommand);
        this.context.subscriptions.push(prepareCommand);
        this.context.subscriptions.push(addLibraryCommand);
        this.context.subscriptions.push(removeLibraryCommand);
        this.context.subscriptions.push(purgeLibraryCommand);
        this.context.subscriptions.push(refreshLibraryCommand);
        this.kraftChannel.appendLine('Done registering commands.');
    }
}
