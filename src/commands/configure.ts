import { ExtensionContext, OutputChannel, StatusBarItem, window } from 'vscode';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getProjectPath, getUkWorkdir } from './utils';
import { Command } from './Command';

const yaml = require('js-yaml');

export async function kraftConfigure(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    context: ExtensionContext
) {
    // TODO: automatically update kraft.yaml syntax using a kraft command
    const projectPath = getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        return;
    }

    const type = await window.showQuickPick(
        ['from kraft.yaml', 'interactive'],
        { placeHolder: 'Configuration type' }
    );
    if (!type) {
        return;
    }

    kraftStatusBarItem.text = 'Configuring project...';

    try {
        if (type === 'from kraft.yaml') {
            configureFromYaml(
                kraftChannel,
                kraftStatusBarItem,
                projectPath
            );
        } else if (type === 'interactive') {
            configureInteractively(context);
        }
    } catch (error) {
        kraftStatusBarItem.text = '[Error] Configure project';
        kraftChannel.appendLine(`[Error] Configure project ${error}.`);
    }
}

async function configureFromYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    const kraftYamlPath = join(projectPath, 'kraft.yaml');
    if (!existsSync(kraftYamlPath)) {
        kraftChannel.appendLine('No kraft.yaml');
        return;
    }

    const kraftYaml = yaml.safeLoad(readFileSync(kraftYamlPath, 'utf-8'));
    const target = await window.showQuickPick(
        kraftYaml.targets.map((target: { architecture: any; platform: any; }) =>
            `${target.platform}-${target.architecture}`),
        { placeHolder: 'Choose the target' }
    );
    if (!target) {
        return;
    }

    const splitTarget = target.split('-');

    const command = new Command(
        `kraft configure -F -p ${splitTarget[0]} -m ${splitTarget[1]}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, { 'UK_WORKDIR': getUkWorkdir() })
        },
        'Configured project.'
    );

    command.execute(kraftChannel, kraftStatusBarItem);
}

async function configureInteractively(context: ExtensionContext) {
    let terminal = window.createTerminal({
        name: "kraft menuconfig",
        hideFromUser: false,
        shellPath: context.asAbsolutePath(join('src',
            'scripts',
            'configure.sh')),
    });
    terminal.show();
}
