import { OutputChannel, StatusBarItem, window } from 'vscode';
import { Command } from './Command';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { getProjectPath, showErrorMessage, getSourcesDir, getManifestsDir, getKraftYaml, showInfoMessage } from './utils';

export async function kraftClean(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    kraftChannel.show(true);
    const projectPath = getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Clean error: No workspace.');
        return;
    }

    const type = await window.showQuickPick(
        [
            'Clean using interactive CLI',
            'Clean from Kraftfile'
        ],
        { placeHolder: 'Configuration type' }
    );

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Cleaning project..."
    )

    if (type === 'Clean from Kraftfile') {
        cleanFromYaml(kraftChannel, kraftStatusBarItem, projectPath);
    } else {
        cleanInteractively(projectPath);
    }
}

async function cleanFromYaml(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
    projectPath: string
) {
    const kraftYaml = getKraftYaml(projectPath);
    if (kraftYaml.targets == undefined || kraftYaml.targets.length == 0) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Clean error: No target found in Kraftfile.');
        return;
    }
    const targets = kraftYaml.targets.map((target: { architecture: any; platform: any; }) =>
        target.platform == "firecracker" ? `fc-${target.architecture}` : `${target.platform}-${target.architecture}`)
        .filter((target: string) =>
            existsSync(join(
                projectPath,
                '.unikraft',
                'build',
                `${basename(projectPath)}_${target}`
            )
            )
        );
    if (targets.length == 0) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Clean error: No matching target found.');
        return;
    }
    const target = await window.showQuickPick(
        targets,
        { placeHolder: 'Choose the target' }
    );
    if (!target) {
        showErrorMessage(kraftChannel, kraftStatusBarItem, 'Clean error: No target chose.');
        return;
    }

    const splitTarget = target.split('-');

    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    const command = new Command(
        `kraft clean -p ${splitTarget[0]} -m ${splitTarget[1]}`,
        {
            cwd: projectPath,
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
                'KRAFTKIT_PATHS_SOURCES': sourcesDir,
                'KRAFTKIT_NO_CHECK_UPDATES': true
            }),
        },
        'Cleaned project.'
    );

    try {
        command.execute(kraftChannel, kraftStatusBarItem);
    } catch (error) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Clean project ${error}.`
        )
    }
}

async function cleanInteractively(projectPath: string) {
    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    let terminal = window.createTerminal({
        name: "kraft clean",
        cwd: projectPath,
        hideFromUser: false,
        env: Object.assign(process.env, {
            'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
            'KRAFTKIT_PATHS_SOURCES': sourcesDir,
            'KRAFTKIT_NO_CHECK_UPDATES': true
        })
    });
    terminal.show();
    terminal.sendText('kraft clean 2> /tmp/err_kraft_clean');
}
