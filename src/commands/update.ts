/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem } from 'vscode';
import { Command } from './Command';
import { getGithubToken } from './utils';

export async function kraftUpdate(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    const command = new Command(
        `kraft list update`,
        {
            env: Object.assign(
                process.env,
                { 'UK_KRAFT_GITHUB_TOKEN': getGithubToken() })
        },
        'Finished running kraft list update.'
    );

    kraftStatusBarItem.text = 'kraft list update...';

    command.execute(kraftChannel, kraftStatusBarItem);
}
