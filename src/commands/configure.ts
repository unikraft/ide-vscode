/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window } from 'vscode';
import {
    getProjectPath,
    showErrorMessage,
    getSourcesDir,
    getManifestsDir,
    showInfoMessage
} from './utils';

export async function kraftConfigure(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    kraftChannel.show(true);
    // TODO: automatically update kraft.yaml syntax using a kraft command
    const projectPath = getProjectPath();
    const sourceDir = getSourcesDir()
    const manifestsDir = getManifestsDir()
    if (!projectPath) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Configure error: No workspace.')
        return;
    }

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Configuring project..."
    )

    try {
        const terminal = window.createTerminal({
            name: "kraft menu",
            cwd: projectPath,
            hideFromUser: false,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourceDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            })
        });
        terminal.show();
        terminal.sendText('kraft menu 2> /tmp/err_kraft_configure');
    } catch (error) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Configure project ${error}.`
        )
    }
}
