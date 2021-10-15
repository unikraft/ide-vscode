import { ConfigurationTarget, OutputChannel, StatusBarItem, window } from 'vscode';
import { join } from 'path';
import { execSync } from 'child_process';
import { getProjectPath, refreshViews, updateUkWorkdir } from './utils';
import { Command } from './Command';

const { exec } = require(`child_process`);

// TODO: replace ukWorkdir

export async function kraftInitialize(
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    const projectPath = getProjectPath();
    if (!projectPath) {
        kraftChannel.appendLine('No workspace.');
        return;
    }

    const type = await window.showQuickPick(
        ['application', 'library', 'core'],
        { placeHolder: 'application, library or core', }
    );
    if (!type) {
        return;
    }

    kraftStatusBarItem.text = 'Initializing project...';

    try {
        if (type === 'library') {
            initializeLibrary(projectPath, kraftChannel, kraftStatusBarItem);
        } else if (type === 'application') {
            initializeApplication(projectPath, kraftChannel, kraftStatusBarItem);
        } else if (type === 'core') {
            initializeCore(projectPath, kraftChannel, kraftStatusBarItem);
        }
    } catch (error) {
        kraftStatusBarItem.text = '[Error] Initialize project';
        kraftChannel.appendLine(`[Error] Initialize project ${error}.`);
    }
}

async function initializeApplication(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem,
) {
    const ukWorkdir = join(projectPath, '.unikraft');

    const options = {
        cwd: projectPath,
        env: Object.assign(process.env, { 'UK_WORKDIR': ukWorkdir })
    };
    const commands = [new Command(
        'kraft list pull unikraft@staging',
        options,
        'Pulled unikraft.'
    )];

    const template = await window.showQuickPick(
        ['Use existing template', 'Blank application']
    );
    if (!template) {
        return;
    }

    if (template === 'Use existing template') {
        var apps;
        try {
            apps = getApps(ukWorkdir);
        } catch (error) {
            kraftChannel.appendLine('Error: Cannot list application templates');
            return;
        }

        const appTemplate = await window.showQuickPick(
            apps,
            { placeHolder: 'Choose the application template' }
        );
        if (!appTemplate) {
            return;
        }

        commands.push(new Command(
            `kraft init -F -M -t ${appTemplate}`,
            options,
            `Initialized ${appTemplate} application.`,
            () => {
                refreshViews();
                updateUkWorkdir(ukWorkdir, ConfigurationTarget.Workspace);
            }
        ));
    } else {
        commands.push(new Command(
            `kraft init -F -M`,
            options,
            `Initialized blank application.`,
            () => {
                refreshViews();
                updateUkWorkdir(ukWorkdir, ConfigurationTarget.Workspace);
            }
        ));
    }

    commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));

    return;
}

async function initializeLibrary(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    const ukWorkdir = join(projectPath, '.unikraft');
    const libsPath = join(ukWorkdir, 'libs');

    const kraftEnv = Object.assign(process.env, { 'UK_WORKDIR': ukWorkdir });
    const commands  = [new Command(
        'kraft list pull unikraft@staging',
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

    commands.push(new Command(
        `kraft lib init --no-prompt`
            + ` --author-name "${authorName}"`
            + ` --author-email "${authorEmail}"`
            + ` --version ${libVersion}`
            + ` --origin ${libOrigin}`
            + ` ${libName}`,
        { cwd: libsPath, env: kraftEnv },
        `Initialized ${libName} library.`
    ));

    commands.push(new Command(
        `kraft list add ${join(libsPath, libName)}`,
        { env: kraftEnv },
        `Added library to kraft.`
    ));

    commands.push(new Command(
        `kraft init -F -M`,
        { cwd: projectPath, kraftEnv },
        'Initialized blank application.'
    ));

    commands.push(new Command(
        `kraft lib add ${libName}@staging`,
        { cwd: projectPath, env: kraftEnv },
        `Added library ${libName} to project.`,
        () => {
            refreshViews();
            updateUkWorkdir(ukWorkdir, ConfigurationTarget.Workspace);
        }
    ));

    commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));

    window.showInformationMessage('Initialized new library.');
}

async function initializeCore(
    projectPath: string,
    kraftChannel: OutputChannel,
    kraftStatusBarItem: StatusBarItem
) {
    const command = new Command(
        'kraft list pull unikraft@staging',
        {
            cwd: projectPath,
            env: Object.assign(process.env, {'UK_WORKDIR': projectPath})
        },
        'Initialized new core project.',
        () => {
            refreshViews();
            updateUkWorkdir(projectPath, ConfigurationTarget.Workspace);
        }
    );

    command.execute(kraftChannel, kraftStatusBarItem);
}

function getApps(ukWorkdir: string): string[] {
    const jsonApps = execSync(
            'kraft list -a -j',
            {env: Object.assign(process.env, {'UK_WORKDIR': ukWorkdir})}
        ).toString();

    return JSON.parse(jsonApps)
        .applications
        .map((app: { meta: { name: any; }; }) => app.meta.name)
        .sort();
}
