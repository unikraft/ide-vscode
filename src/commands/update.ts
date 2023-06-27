/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem } from 'vscode';
import { Command } from './Command';
import { showInfoMessage } from './utils';

export async function kraftUpdate(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    kraftChannel.show(true);
    const command = new Command(
        `kraft pkg update`,
        {
            env: Object.assign(
                process.env)
        },
        'Finished running kraft pkg update.'
    );

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "kraft pkg update..."
    )

    command.execute(kraftChannel, kraftStatusBarItem);
}
