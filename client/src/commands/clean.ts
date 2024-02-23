import { OutputChannel, StatusBarItem } from 'vscode';
import { Command } from './Command';
import * as utils from './utils';

export async function kraftClean(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    kraftChannel.show(true);
    const projectPath = utils.getProjectPath();
    if (!projectPath) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Clean error: No workspace.');
        return;
    }
    cleanFromYaml(kraftChannel, kraftStatusBarItem, projectPath);
}

async function cleanFromYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    const target = await utils.getTarget(
        kraftChannel,
        kraftStatusBarItem,
        projectPath
    );
    if (!target) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem, 'Clean error: No target chosen.');
        return;
    }
    const splitTarget = target.split('-');
    const sourcesDir = utils.getSourcesDir();
    const manifestsDir = utils.getManifestsDir();
    utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Cleaning project..."
    )
    const command = new Command(
        `kraft clean --log-type=basic -p ${splitTarget[0]} -m ${splitTarget[1]}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            }),
        },
        'Cleaned project.',
        () => {
            kraftStatusBarItem.text = 'Unikraft';
        }
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Clean project ${error}.`
        );
        kraftStatusBarItem.text = 'Unikraft';
    }
}
