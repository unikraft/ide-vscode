import { OutputChannel, StatusBarItem, window } from 'vscode';
import { Command } from './Command';
import { getProjectPath, showErrorMessage, getSourcesDir, getManifestsDir, getKraftYaml, showInfoMessage } from './utils';

export async function kraftFetch(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    kraftChannel.show(true);
    const projectPath = getProjectPath();
    if (!projectPath) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Fetch error: No workspace.');
        return;
    }

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Fetching dependencies..."
    )

    fetchFromYaml(kraftChannel, kraftStatusBarItem, projectPath);
}

async function fetchFromYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    const kraftYaml = getKraftYaml(projectPath);
    if (kraftYaml.targets == undefined || kraftYaml.targets.length == 0) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Fetch error: No target found in Kraftfile.');
        return;
    }
    const targets = kraftYaml.targets.map((target: { architecture: any; platform: any; }) =>
        `${target.platform}-${target.architecture}`)
    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );
    if (!target) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Fetch error: No target chose.');
        return;
    }

    const splitTarget = target.split('-');

    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    const command = new Command(
        `kraft fetch -p ${splitTarget[0]} -m ${splitTarget[1]}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            }),
        },
        'Fetched dependencies.',
        () => { }
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Fetch dependencies ${error}.`
        )
    }
}
