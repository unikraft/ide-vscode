/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window } from 'vscode';
import { join } from 'path';
import { execSync } from 'child_process';
import { getProjectPath, getSourcesDir, getManifestsDir, refreshViews, getDefaultFileNames, showErrorMessage, getKraftYaml, getKraftYamlPath, showInfoMessage } from './utils';
import { Command } from './Command';
import { setupLangSupport } from '../language/language';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';

const YAML = require('yaml')

export async function kraftInitialize(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    kraftChannel.show(true);
    const projectPath = getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        return;
    }

    // Deleted 'application' option from the below quickPick as command `kraft init`
    // is not available in `Kraftkit`, Once command is available in `Kraftkit`.
    // Please add in below quickPick.
    const type = await window.showQuickPick(
        ['library'],
        { placeHolder: 'library', }
    );
    if (!type) {
        return;
    }

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Initializing project..."
    )

    try {
        if (type === 'library') {
            initializeLibrary(projectPath, kraftChannel, kraftStatusBarItem);
        } else if (type === 'application') {
            initializeApplication(projectPath, kraftChannel, kraftStatusBarItem);
        }
    } catch (error) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Initialize project ${error}.`
        )
    }
}

async function initializeApplication(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    showErrorMessage(
        kraftChannel,
        kraftStatusBarItem,
        "Creating application template is not possible as command `kraft init` is not available in the `kraftkit`."
    )

    // Uncomment below code once `kraft init` is available in `kraftkit`.

    // const initWorkdir = await chooseInitWorkdir();
    // if (!initWorkdir) {
    //     return;
    // }

    // let appsPath
    // if (initWorkdir.endsWith('.unikraft')) {
    //     appsPath = join(initWorkdir, 'apps');
    // } else {
    //     appsPath = join(initWorkdir, 'sources');
    // }

    // let sourcesDir = getSourcesDir();
    // let manifestsDir = getManifestsDir();
    // let kraftEnv = Object.assign(process.env, {
    //     'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
    //     'KRAFTKIT_PATHS_SOURCES': sourcesDir,
    //     'KRAFTKIT_NO_CHECK_UPDATES': true
    // })
    // const commands = [new Command(
    //     'kraft pkg pull unikraft@staging',
    //     { cwd: projectPath, env: kraftEnv },
    //     'Pulled unikraft.'
    // )];

    // const template = await window.showQuickPick(
    //     ['Use existing template', 'Blank application']
    // );
    // if (!template) {
    //     return;
    // }

    // if (template === 'Use existing template') {
    //     var apps;
    //     try {
    //         apps = getApps(ukPackWorkdir);
    //         if (apps.length == 0) {
    //             kraftChannel.appendLine('Not found any application template');
    //             return
    //         }
    //     } catch (error) {
    //         kraftChannel.appendLine('Error: Cannot list application templates');
    //         return;
    //     }

    //     const appTemplate = await window.showQuickPick(
    //         apps,
    //         { placeHolder: 'Choose the application template' }
    //     );
    //     if (!appTemplate) {
    //         return;
    //     }


    //     commands.push(new Command(
    //         `kraft init -F -M -t ${appTemplate}`,
    //         {cwd: appsPath, env: kraftEnv},
    //         `Initialized ${appTemplate} application.`,
    //         () => {
    //             refreshViews();
    //             updateUkPackWorkdir(ukPackWorkdir, ConfigurationTarget.Workspace);
    //             setupLangSupport(projectPath);
    //         }
    //     ));

    // } else {

    //     commands.push(new Command(
    //         `kraft init -F -M`,
    //         {cwd: appsPath, env: kraftEnv},
    //         `Initialized blank application.`,
    //         () => {
    //             refreshViews();
    //             updateUkPackWorkdir(ukPackWorkdir, ConfigurationTarget.Workspace);
    //             setupLangSupport(join(projectPath));
    //         }
    //     ));
    // }

    // commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));

    return;
}

async function initializeLibrary(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    const initWorkdir = await chooseInitWorkdir();
    if (!initWorkdir) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `No path specified.`
        );
        return;
    }

    let libsPath = initWorkdir
    let isProjectPathUnikraft = false
    if (initWorkdir.includes(join(projectPath, '.unikraft'))) {
        libsPath = join(initWorkdir, 'libs');
        isProjectPathUnikraft = true;
    }

    if (!isProjectPathUnikraft && !existsSync(libsPath)) {
        mkdirSync(libsPath, { recursive: true });
        window.showInformationMessage(`Created directory ${libsPath}`);
    }

    if (!isProjectPathUnikraft && !existsSync(libsPath)) {
        showErrorMessage(kraftChannel, kraftStatusBarItem,
            `Cound not create directory ${libsPath}.`
        );
        return
    }

    let sourcesDir = getSourcesDir();
    let manifestsDir = getManifestsDir();
    const kraftEnv = Object.assign(process.env, {
        'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
        'KRAFTKIT_PATHS_SOURCES': sourcesDir,
        'KRAFTKIT_NO_CHECK_UPDATES': true
    });

    const commands = [new Command(
        'kraft pkg pull unikraft:staging',
        { cwd: projectPath, env: kraftEnv },
        'Pulled unikraft.'
    )];

    const libName = await window.showInputBox({
        placeHolder: `Insert library name`,
    });
    if (!libName) {
        return;
    }

    const libOrigin = await window.showInputBox({
        placeHolder: `Insert library origin`,
    });
    if (!libOrigin) {
        return;
    }

    const libVersion = await window.showInputBox({
        placeHolder: `Insert library version`,
    });
    if (!libVersion) {
        return;
    }

    const authorName = await window.showInputBox({
        placeHolder: `Insert author name`,
    });
    if (!authorName) {
        return;
    }

    const authorEmail = await window.showInputBox({
        placeHolder: `Insert author email`,
    });
    if (!authorEmail) {
        return;
    }

    // This command creates a new library and package the created library.
    commands.push(new Command(
        `kraft lib create --no-prompt --soft-pack`
        + ` --author-name "${authorName}"`
        + ` --author-email "${authorEmail}"`
        + ` --version ${libVersion}`
        + ` --origin ${libOrigin}`
        + ` --project-name ${libName}`,
        { cwd: libsPath, env: kraftEnv },
        `Initialized ${libName} library.`
    ));

    if (isProjectPathUnikraft) {
        // When creating library at $PWD/.unikraft/ to the project then
        // library is initialized at the location `$PWD/.unikraft/libs/`
        // therefore no need to add the custom created library to the project
        // with the command `kraft pkg add`
        // Just Updating Kraftfile will work fine.
        let kraftYamlPath = getKraftYamlPath(projectPath);
        if (!kraftYamlPath) {
            return;
        }
        let kraftYaml = getKraftYaml(projectPath);
        if (kraftYaml["libraries"] == undefined) {
            kraftYaml["libraries"] = {};
        }
        kraftYaml["libraries"][libName] = {
            "version": "default"
        };
        writeFileSync(kraftYamlPath, YAML.stringify(kraftYaml));
    } else {
        commands.push(new Command(
            `kraft pkg add ${libName}`,
            { cwd: projectPath, env: kraftEnv },
            `Added library ${libName} to the project.`,
            () => {
                refreshViews();
                setupLangSupport(join(projectPath));
            }
        ));
    }
    commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));

    showInfoMessage(kraftChannel, kraftStatusBarItem,
        `Initialized new library at the location ${libsPath}.`
    )
}

function getApps(ukPackWorkdir: string): string[] {
    const jsonApps = execSync(
        'kraft pkg list --apps -o=json',
        {
            env: Object.assign(process.env, {
                'KRAFTKIT_PATHS_MANIFESTS': join(ukPackWorkdir, 'manifests'),
                'KRAFTKIT_PATHS_SOURCES': join(ukPackWorkdir, 'sources'),
                'KRAFTKIT_NO_CHECK_UPDATES': true
            })
        }
    ).toString();

    if (jsonApps.trim().toLowerCase() == "null") {
        window.showErrorMessage("Not found any existing application.")
        return []
    }

    return JSON.parse(jsonApps)
        .map((app: { format: string, latest: string, package: string, type: string }) => app.package)
        .sort();
}

async function chooseInitWorkdir(): Promise<string | undefined> {
    let path = window.showInputBox({
        placeHolder: `Insert path where to initialize library`,
        value: homedir()
    });

    return path;
}
