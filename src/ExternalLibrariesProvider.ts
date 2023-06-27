/* SPDX-License-Identifier: BSD-3-Clause */

import { Event, EventEmitter, OutputChannel, StatusBarItem, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from 'vscode';
import { existsSync, readFileSync, readdirSync, rmdirSync, writeFile, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import {
	getProjectPath, refreshViews, removeCore, getSourcesDir, getManifestsDir, showErrorMessage, getKraftYaml, getKraftYamlPath, removeCoreProjectDir, showInfoMessage
} from './commands/utils';
import { Command } from './commands/Command';
import { string } from 'yaml/dist/schema/common/string';

const yaml = require('js-yaml');
const YAML = require('yaml')

export class ExternalLibrariesProvider implements TreeDataProvider<Library> {

	private _onDidChangeTreeData: EventEmitter<Library | undefined | void> = new EventEmitter<Library | undefined | void>();
	readonly onDidChangeTreeData: Event<Library | undefined | void> = this._onDidChangeTreeData.event;

	constructor(
		private projectPath: string | undefined,
		private _sourcesDir: string,
		private _manifestsDir: string
	) { }

	public get sourcesDir(): string {
		return this._sourcesDir;
	}

	public get manifestsDir(): string {
		return this._manifestsDir;
	}

	public set sourcesDir(value: string) {
		this._sourcesDir = value;
		this.kraftEnv['KRAFTKIT_PATHS_SOURCES'] = value;
	}

	public set manifestsDir(value: string) {
		this._manifestsDir = value;
		this.kraftEnv['KRAFTKIT_PATHS_MANIFESTS'] = value
	}

	private kraftEnv = Object.assign(
		process.env,
		{
			'KRAFTKIT_PATHS_MANIFESTS': this._manifestsDir,
			'KRAFTKIT_PATHS_SOURCES': this._sourcesDir,
			'KRAFTKIT_NO_CHECK_UPDATES': true
		},
	);

	refresh(): void {
		this.projectPath = getProjectPath();
		this.sourcesDir = getSourcesDir();
		this.manifestsDir = getManifestsDir();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Library): TreeItem {
		return element;
	}

	getChildren(element?: Library): Thenable<Library[]> {
		if (!this.projectPath) {
			window.showInformationMessage('No library in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(this.getData(element));
		}

		const kraftYaml = getKraftYaml(this.projectPath);
		const core = this.getCore(kraftYaml);
		const presentLibs = this.getPresentLibs(kraftYaml);
		return Promise.resolve(core.concat(presentLibs));
	}

	async addLibrary(
		kraftChannel: OutputChannel,
		kraftStatusBarItem: StatusBarItem
	) {
		if (!this.projectPath) {
			showErrorMessage(kraftChannel, kraftStatusBarItem, "No workspace.")
			return;
		}

		const options = { cwd: this.projectPath, env: this.kraftEnv };
		let libs = this.getLibs();

		const jsonCore = execSync('kraft pkg list -C -o=json', { env: this.kraftEnv }).toString()
		const core: Library[] = JSON.parse(jsonCore)
			.map((core: { format: string, latest: string, package: string, type: string }) =>
				this.toLib({ meta: { name: core.package }, data: core }, '', false))
		libs = libs.concat(core)

		const lib = await window.showQuickPick(
			libs.map(lib => lib.name),
			{ placeHolder: 'Choose the library' }
		);
		if (!lib) {
			return;
		}
		let versions: string[] = this.getLibVersions(lib);
		const version = await window.showQuickPick(
			versions,
			{ placeHolder: 'Choose the library version' }
		);
		if (!version) {
			return;
		}
		kraftChannel.show(true);

		let pullCommand
		if (lib.toLowerCase() == "unikraft") {
			removeCoreProjectDir(kraftChannel, kraftStatusBarItem, this.projectPath)
			pullCommand = new Command(
				`kraft pkg pull ${lib}:${version}`,
				options,
				`Pulled ${lib} with ${version} version.`,
				refreshViews
			);

			let kraftYamlPath = getKraftYamlPath(this.projectPath);
			if (!kraftYamlPath) {
				showErrorMessage(kraftChannel, kraftStatusBarItem, "Kraftfile not found.")
				return;
			}
			let kraftYaml = getKraftYaml(this.projectPath)
			if (!kraftYaml.unikraft) {
				kraftYaml.unikraft = {}
			}
			kraftYaml.unikraft.version = version
			writeFileSync(kraftYamlPath, YAML.stringify(kraftYaml))
		} else {
			pullCommand = new Command(
				`kraft pkg add ${lib}:${version}`,
				options,
				`Added ${lib} with ${version} version.`,
				refreshViews
			);
		}

		pullCommand.execute(kraftChannel, kraftStatusBarItem);
	}

	private getCore(kraftYaml: any): Library[] {
		const jsonCore = execSync('kraft pkg list -C -o=json', { env: this.kraftEnv }).toString()
		const core = JSON.parse(jsonCore)[0];
		const isInKraftYaml = Object.keys(kraftYaml).includes('unikraft');
		return [this.toLib(
			{
				meta: {
					name: core.package
				},
				data: core
			},
			isInKraftYaml ? this.getKraftVersion(kraftYaml.unikraft) : core.latest,
			isInKraftYaml ? true : false
		)].filter(lib => lib.isPresent());
	}

	private getPresentLibs(kraftYaml: any): Library[] {
		const rawLibs = this.listLibs();
		const kraftLibs = Object.keys(kraftYaml).includes('libraries') ? Object.keys(kraftYaml.libraries) : [];
		const libs = rawLibs.map((lib) => {
			const libIndex = kraftLibs.indexOf(lib.package);

			if (libIndex !== -1) {
				kraftLibs.splice(libIndex, 1);
			}

			return this.toLib(
				{
					meta: {
						name: lib.package
					},
					data: lib
				},
				libIndex !== -1 ?
					this.getKraftVersion(kraftYaml.libraries[lib.package]) :
					lib.latest,
				libIndex !== -1 ? true : false
			);
		});

		const kraftOnlyLibs = this.getKraftOnlyLibs(kraftYaml, kraftLibs);

		return libs
			.filter(lib => lib.isPresent())
			.concat(kraftOnlyLibs)
			.sort(this.compareLibs);
	}

	private getKraftOnlyLibs(kraftYaml: any, kraftLibs: string[]): Library[] {
		return kraftLibs.map((lib: string) => new Library(
			lib,
			this.getKraftVersion(kraftYaml.libraries[lib]),
			true,
			this.isAvailableLocally(lib, this.getKraftVersion(kraftYaml.libraries[lib])),
			'',
			TreeItemCollapsibleState.None,
			this.projectPath,
			this.kraftEnv)
		);
	}

	private getLibs(): Library[] {
		const libs = this.listLibs()
			.map((lib: { format: string, latest: string, package: string, type: string }) =>
				this.toLib({ meta: { name: lib.package }, data: lib }, '', false))
			.sort(this.compareLibs);

		return libs;
	}

	private listLibs(): [{ format: string, latest: string, package: string, type: string }] {
		const jsonLibs = execSync('kraft pkg list -L -o=json', { env: this.kraftEnv })
			.toString();
		return JSON.parse(jsonLibs);
	}

	private getKraftVersion(lib: any): string {
		return Object.keys(lib).includes('version') ? lib.version : lib;
	}

	private getData(lib: Library): Library[] {
		const details = Object.keys(lib.data);
		return details.map(key => new Library(
			key,
			lib.data[key],
			false,
			false,
			(lib.data[key] && typeof lib.data[key] !== 'string') ?
				lib.data[key] : '',
			(lib.data[key] && typeof lib.data[key] !== 'string') ?
				TreeItemCollapsibleState.Collapsed :
				TreeItemCollapsibleState.None,
			this.projectPath,
			this.kraftEnv)
		);
	}

	private toLib(
		lib: { meta: { name: any; }, data: { format: string, latest: string, package: string, type: string } },
		kraftVersion: string,
		isInKraftYaml: boolean
	): Library {
		return new Library(
			lib.meta.name,
			kraftVersion,
			isInKraftYaml,
			this.isAvailableLocally(lib.meta.name, kraftVersion),
			lib.data,
			TreeItemCollapsibleState.Collapsed,
			this.projectPath,
			this.kraftEnv
		);
	};

	private isAvailableLocally(libName: string, kraftVersion: string): boolean {
		let fileExist = false;

		let sourcesFiles = readdirSync(this._sourcesDir)
		sourcesFiles.forEach((element: string) => {
			if (element.includes(libName) && element.includes(kraftVersion)) {
				fileExist = true
			}
		})
		if (fileExist) {
			return true
		}

		const libYamlPath = join(this._manifestsDir, "libs", `${libName}.yaml`)
		if (existsSync(libYamlPath)) {
			const libyaml = yaml.load(readFileSync(libYamlPath))
			if (existsSync(libyaml.origin)) {
				fileExist = true
			}
		}

		return fileExist;
	}

	private compareLibs(lib1: Library, lib2: Library): number {
		if (lib1.name < lib2.name) {
			return -1;
		}

		return 1;
	}

	private getLibVersions(lib: string): string[] {
		const libDetails = execSync(
			`kraft pkg show -o=json ${lib}`,
			{ env: this.kraftEnv }
		).toString();
		const jsonLibDetails = JSON.parse(libDetails);
		let channelVersions: string[] = jsonLibDetails.channels.map((channel:
			{ Name: string, Default: boolean, Latest: string, Manifest: string, Resource: string, Sha256: string }
		) =>
			channel["Name"]
		).filter((str: string) => str !== '')

		let versions: string[] = jsonLibDetails.versions ?
			jsonLibDetails.versions.map(
				(dist: { Version: string, Resource: string, Sha256: string, Type: string, Unikraft: string }) =>
					dist["Version"]
			).filter((str: string) => str !== '') : []

		return channelVersions.concat(versions)
	}
}

export class Library extends TreeItem {

	constructor(
		public readonly name: string,
		private _kraftVersion: string,
		private _isInKraftYaml: boolean,
		private readonly isAvailable: boolean,
		public readonly data: any,
		public readonly collapsibleState: TreeItemCollapsibleState,
		private readonly projectPath: string | undefined,
		private readonly kraftEnv: any
	) {
		super(name, collapsibleState);

		this.tooltip = `${this.name}-${this._kraftVersion}`;
		this.description = this._kraftVersion;
		this.data = data;
	}

	iconPath = {
		light: join(__filename, '..', '..', 'resources', 'light',
			this.getIconName()),
		dark: join(__filename, '..', '..', 'resources', 'dark',
			this.getIconName())
	};

	contextValue = 'library';

	public get kraftVersion(): string {
		return this._kraftVersion;
	}
	public set kraftVersion(value: string) {
		this._kraftVersion = value;
	}

	public get isInKraftYaml(): boolean {
		return this._isInKraftYaml;
	}

	public set isInKraftYaml(value: boolean) {
		this._isInKraftYaml = value;
	}

	public isPresent(): boolean {
		return this._isInKraftYaml || this.isAvailable;
	}

	private removeCore(
		kraftChannel: OutputChannel,
		kraftStatusBarItem: StatusBarItem
	) {
		if (!this.projectPath) {
			showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"No workspace."
			)
			return
		}

		let kraftYamlPath = getKraftYamlPath(this.projectPath)
		if (!kraftYamlPath) {
			return
		}
		let kraftYaml = getKraftYaml(this.projectPath)
		kraftYaml["unikraft"] = undefined
		writeFileSync(kraftYamlPath, YAML.stringify(kraftYaml))
		if (existsSync(join(this.projectPath, '.unikraft', 'unikraft'))) {
			rmdirSync(join(this.projectPath, '.unikraft', 'unikraft'), { recursive: true })
		}
	}

	private getIconName(): string {
		if (this._isInKraftYaml && this.isAvailable) {
			return 'lib_present.svg';
		}

		if (this._isInKraftYaml) {
			return 'kraft_no_lib.svg';
		}

		if (this.isAvailable) {
			return 'lib_no_kraft.svg';
		}

		return '';
	}

	removeLibrary(
		kraftChannel: OutputChannel,
		kraftStatusBarItem: StatusBarItem,
		purge?: boolean
	) {
		kraftChannel.show(true);
		if (!this.projectPath) {
			showErrorMessage(kraftChannel, kraftStatusBarItem, "No workspace found.")
			return;
		}

		showInfoMessage(kraftChannel, kraftStatusBarItem,
			`Removing library ${this.name}...`
		)
		const commands = []

		if (this._isInKraftYaml) {
			if (this.name == "unikraft") {
				removeCore(kraftChannel, kraftStatusBarItem, this.projectPath);
			} else {
				commands.push(new Command(
					`kraft pkg remove ${this.name}`,
					{ cwd: this.projectPath, env: this.kraftEnv },
					`Removed ${this.name}:${this._kraftVersion} from the project directory.`,
					refreshViews
				))
			}
		} else if (!purge) {
			showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"Could not remove package as it is not used by the project."
			);
			return;
		}

		if (this.isAvailable && purge) {
			commands.push(new Command(
				`kraft pkg prune ${this.name}:${this._kraftVersion}`,
				{ cwd: this.projectPath, env: this.kraftEnv },
				`Pruned ${this.name}:${this._kraftVersion} from the system.`,
				refreshViews
			))
		} else if (purge) {
			showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"Could not purge package as it is not available on the host machine."
			);
		}

		if (commands.length == 1) {
			commands[0].execute(kraftChannel, kraftStatusBarItem);
		} else if (commands.length > 1) {
			commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));
		}
	}
}
