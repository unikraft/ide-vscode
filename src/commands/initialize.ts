/* SPDX-License-Identifier: BSD-3-Clause */

import { OutputChannel, StatusBarItem, window, workspace } from 'vscode';
import { join } from 'path';
import * as utils from './utils';
import { Command } from './Command';
import { setupLangSupport } from '../language/language';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { stringify as yamlStringify } from 'yaml';

export async function kraftInitialize(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    kraftChannel.show(true);
    const projectPath = utils.getProjectPath();
    if (!projectPath) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
            "No workspace."
        )
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

    try {
        if (type === 'library') {
            initializeLibrary(projectPath, kraftChannel, kraftStatusBarItem);
        } else if (type === 'application') {
            initializeApplication(projectPath, kraftChannel, kraftStatusBarItem);
        }
    } catch (error) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
            `[Error] Initialize project ${error}.`
        )
    }
}

async function initializeLibrary(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    const initWorkdir = await chooseInitWorkdir();
    if (!initWorkdir) {
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
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
        utils.showErrorMessage(kraftChannel, kraftStatusBarItem,
            `Cound not create directory ${libsPath}.`
        );
        return
    }

    const sourcesDir = utils.getSourcesDir();
    const manifestsDir = utils.getManifestsDir();
    const kraftEnv = Object.assign(process.env, {
        'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
        'KRAFTKIT_PATHS_SOURCES': sourcesDir,
        'KRAFTKIT_NO_CHECK_UPDATES': true
    });

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
    const commands = [new Command(
        `kraft lib create --no-prompt --update-refs ${getInitLibraryArgs().trim()}`
        + ` --author-name "${authorName}"`
        + ` --author-email "${authorEmail}"`
        + ` --version ${libVersion}`
        + ` --origin ${libOrigin}`
        + ` --project-name ${libName}`,
        { cwd: libsPath, env: kraftEnv },
        `Initialized ${libName} library.`,
        () => {
            kraftStatusBarItem.text = 'Unikraft';
        }
    )];

    if (isProjectPathUnikraft) {
        // When creating library at $PWD/.unikraft/ to the project then
        // library is initialized at the location `$PWD/.unikraft/libs/`
        // therefore no need to add the custom created library to the project
        // with the command `kraft lib add`
        // Just Updating Kraftfile will work fine.
        const kraftYamlPath = utils.getKraftYamlPath(projectPath);
        if (!kraftYamlPath) {
            return;
        }
        const kraftYaml = utils.getKraftYaml(projectPath);
        if (!kraftYaml) {
            return
        }
        if (kraftYaml["libraries"] == undefined) {
            kraftYaml["libraries"] = {};
        }
        kraftYaml["libraries"][libName] = {
            "version": "default",
            kconfig: undefined
        };
        writeFileSync(kraftYamlPath, yamlStringify(kraftYaml));
        utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
            `Initialized library at ${libsPath}.`
        );
        kraftStatusBarItem.text = 'Unikraft';
    } else {
        commands.push(new Command(
            `kraft lib add --log-type=basic ${libName}`,
            { cwd: projectPath, env: kraftEnv },
            `Added library ${libName} to the project.`,
            () => {
                utils.refreshViews();
                setupLangSupport(join(projectPath));
                utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
                    `Initialized library at ${libsPath}.`
                );
                kraftStatusBarItem.text = 'Unikraft';
            }
        ));
    }
    utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
        "Initializing project..."
    )
    commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));
}

async function chooseInitWorkdir(): Promise<string | undefined> {
    const path = window.showInputBox({
        placeHolder: `Insert path where to initialize library`,
        value: homedir()
    });

    return path;
}

function getInitLibraryArgs(): string {
    let buildArgs: string = "";
    const noProvideMain = workspace.getConfiguration().get('unikraft.initialize.library.noProvideMain', false);
    if (noProvideMain) {
        buildArgs += ' --no-provide-c-main';
    }

    const gitInit = workspace.getConfiguration().get('unikraft.initialize.library.gitInit', true);
    if (gitInit) {
        buildArgs += ' --git-init';
    }

    const withPatchdir = workspace.getConfiguration().get('unikraft.initialize.library.withPatchdir', false);
    if (withPatchdir) {
        buildArgs += ' --patch-dir';
    }
    return buildArgs;
}

async function initializeApplication(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    utils.showErrorMessage(
        kraftChannel,
        kraftStatusBarItem,
        "Creating application template is not possible as command `kraft init` is not available in the `kraftkit`."
    )

    // ***********************Uncomment below code once `kraft init` is available in `kraftkit`***********************

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

    // let sourcesDir = utils.getSourcesDir();
    // let manifestsDir = utils.getManifestsDir();
    // let kraftEnv = Object.assign(process.env, {
    //     'KRAFTKIT_PATHS_MANIFESTS': manifestsDir,
    //     'KRAFTKIT_PATHS_SOURCES': sourcesDir,
    //     'KRAFTKIT_NO_CHECK_UPDATES': true
    // })
    // const commands = [new Command(
    //     'kraft pkg pull unikraft@staging',
    //     { cwd: projectPath, env: kraftEnv },
    //     'Pulled unikraft.',
    //      () => {}
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
    //             utils.refreshViews();
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
    //             utils.refreshViews();
    //             updateUkPackWorkdir(ukPackWorkdir, ConfigurationTarget.Workspace);
    //             setupLangSupport(join(projectPath));
    //         }
    //     ));
    // }

    // commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));

    return;
}

// function getApps(ukPackWorkdir: string): string[] {
//     const jsonApps = execSync(
//         'kraft pkg list --apps -o=json',
//         {
//             env: Object.assign(process.env, {
//                 'KRAFTKIT_PATHS_MANIFESTS': join(ukPackWorkdir, 'manifests'),
//                 'KRAFTKIT_PATHS_SOURCES': join(ukPackWorkdir, 'sources'),
//                 'KRAFTKIT_NO_CHECK_UPDATES': true
//             })
//         }
//     ).toString();

//     if (jsonApps.trim().toLowerCase() == "null") {
//         window.showErrorMessage("Not found any existing application.")
//         return []
//     }

//     return JSON.parse(jsonApps)
//         .map((app: { format: string, latest: string, package: string, type: string }) => app.package)
//         .sort();
// }
