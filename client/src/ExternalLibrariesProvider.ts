/* SPDX-License-Identifier: BSD-3-Clause */

import * as vscode from 'vscode';
import {
	existsSync,
	readdirSync,
	writeFileSync
} from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import * as utils from './commands/utils';
import { Command } from './commands/Command';
import { stringify as yamlStringify } from 'yaml';
import * as types from './types/types';
import { reloadIncludes } from './language/c';

export class ExternalLibrariesProvider implements vscode.TreeDataProvider<Library> {

	private _onDidChangeTreeData: vscode.EventEmitter<Library | undefined | void> = new vscode.EventEmitter<Library | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Library | undefined | void> = this._onDidChangeTreeData.event;

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
		this.kraftEnv['KRAFTKIT_PATHS_MANIFESTS'] = value;
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
		this.projectPath = utils.getProjectPath();
		this.sourcesDir = utils.getSourcesDir();
		this.manifestsDir = utils.getManifestsDir();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Library): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Library): Thenable<Library[]> {
		if (!this.projectPath) {
			vscode.window.showInformationMessage('No library in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(this.getData(element));
		}

		const kraftYaml = utils.getKraftYaml(this.projectPath);
		if (!kraftYaml) {
			vscode.window.showErrorMessage("could not fetch Kraftfile");
			return Promise.resolve([]);
		}
		const core = this.getCore(kraftYaml);
		const presentLibs = this.getPresentLibs(kraftYaml);
		return Promise.resolve(core.concat(presentLibs));
	}

	async addLibrary(
		kraftChannel: vscode.OutputChannel,
		kraftStatusBarItem: vscode.StatusBarItem
	) {
		if (!this.projectPath) {
			utils.showErrorMessage(kraftChannel, kraftStatusBarItem, "No workspace.")
			return;
		}
		const projectPath = this.projectPath
		let pullCommand;
		const options = { cwd: projectPath, env: this.kraftEnv };
		let core: Library[] = []
		let libs = this.getLibs();
		let jsonCore = execSync('kraft pkg list --log-type=basic -C -o=json', { env: this.kraftEnv }).toString();
		jsonCore = utils.pkgExtractor(jsonCore);
		if (jsonCore.length > 0) {
			core = JSON.parse(jsonCore)
				.map((core: types.ListDataType) =>
					this.toLib({ meta: { name: core.name }, data: core }, '', false));

		}
		libs = libs.concat(core);
		const lib = await vscode.window.showQuickPick(
			libs.map(lib => lib.name),
			{ placeHolder: 'Choose the library' }
		);
		if (!lib) {
			return;
		}

		const versions: string[] = this.getLibVersions(lib);
		if (versions.length == 0) {
			utils.showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"Not found any version of the selected library."
			);
			return;
		}

		const version = await vscode.window.showQuickPick(
			versions,
			{ placeHolder: 'Choose the library version' }
		);
		if (!version) {
			return;
		}
		kraftChannel.show(true);
		if (lib.toLowerCase() == "unikraft") {
			utils.removeCoreProjectDir(kraftChannel, kraftStatusBarItem, projectPath)
			pullCommand = new Command(
				`kraft pkg pull --log-type=basic ${lib}:${version}`,
				options,
				`Pulled ${lib} with ${version} version.`,
				() => {
					const kraftYamlPath = utils.getKraftYamlPath(projectPath);
					if (!kraftYamlPath) {
						utils.showErrorMessage(
							kraftChannel,
							kraftStatusBarItem,
							"Kraftfile not found."
						);
						return;
					}
					const kraftYaml = utils.getKraftYaml(projectPath)
					if (!kraftYaml) {
						return
					}
					kraftYaml.unikraft = {
						version: version,
						kconfig: undefined
					}
					writeFileSync(kraftYamlPath, yamlStringify(kraftYaml));
					utils.showInfoMessage(kraftChannel,
						kraftStatusBarItem,
						`Added ${lib}:${version} to Kraftfile.`
					);
					kraftStatusBarItem.text = 'Unikraft';
					utils.refreshViews();
					reloadIncludes(projectPath);
				}
			);
		} else {
			pullCommand = new Command(
				`kraft lib add --log-type=basic ${lib}:${version}`,
				options,
				`Finished adding ${lib}:${version}.`,
				() => {
					kraftStatusBarItem.text = 'Unikraft';
					utils.refreshViews();
					reloadIncludes(projectPath);
				}
			);
		}
		utils.showInfoMessage(kraftChannel, kraftStatusBarItem, "Adding library...")
		pullCommand.execute(kraftChannel, kraftStatusBarItem);
	}

	private getCore(kraftYaml: types.KraftYamlType): Library[] {
		let jsonCore = execSync('kraft pkg list --log-type=basic -C -o=json', { env: this.kraftEnv }).toString()
		jsonCore = utils.pkgExtractor(jsonCore);
		if (jsonCore.length == 0) {
			return [];
		}
		const core = JSON.parse(jsonCore)[0];
		let isInKraftYaml: boolean = false
		if (kraftYaml.unikraft) {
			isInKraftYaml = true
		}
		return [this.toLib(
			{
				meta: {
					name: core.name
				},
				data: core
			},
			isInKraftYaml ? this.getKraftLibVersion(kraftYaml.unikraft) : core.version,
			isInKraftYaml
		)].filter(lib => lib.isPresent());
	}

	private getPresentLibs(kraftYaml: types.KraftYamlType): Library[] {
		const rawLibs = this.listLibs();
		const kraftLibs = Object.keys(kraftYaml).includes('libraries') && kraftYaml.libraries !== null ?
			Object.keys(kraftYaml.libraries) : [];
		const libs = rawLibs.filter((lib) => {
			if (lib.name.length > 0) {
				return lib;
			}
		}).map((lib) => {
			const libIndex = kraftLibs.indexOf(lib.name);

			if (libIndex !== -1) {
				kraftLibs.splice(libIndex, 1);
			}

			return this.toLib(
				{
					meta: {
						name: lib.name
					},
					data: lib
				},
				libIndex !== -1 ?
					this.getKraftLibVersion(kraftYaml.libraries[lib.name]) :
					lib.version,
				libIndex !== -1 ? true : false
			);
		});
		const kraftOnlyLibs = this.getKraftOnlyLibs(kraftYaml, kraftLibs);
		return libs
			.concat(kraftOnlyLibs)
			.filter(lib => lib.isPresent())
			.sort(this.compareLibs);
	}

	private getKraftOnlyLibs(kraftYaml: types.KraftYamlType, kraftLibs: string[]): Library[] {
		return kraftLibs.map((lib: string) => new Library(
			lib,
			this.getKraftLibVersion(kraftYaml.libraries[lib]),
			true,
			this.isAvailableLocally(lib, this.getKraftLibVersion(kraftYaml.libraries[lib])),
			'',
			vscode.TreeItemCollapsibleState.None,
			this.projectPath,
			this.kraftEnv)
		);
	}

	private getLibs(): Library[] {
		const libs = this.listLibs().filter(lib => {
			if (lib.name.length > 0) {
				return lib;
			}
		}).map((lib: types.ListDataType) =>
			this.toLib({ meta: { name: lib.name }, data: lib }, '', false)
		).sort(this.compareLibs)

		return libs;
	}

	private listLibs(): [types.ListDataType] {
		let jsonLibs = execSync('kraft pkg list --log-type=basic -L -o=json', { env: this.kraftEnv })
			.toString();
		jsonLibs = utils.pkgExtractor(jsonLibs);
		if (jsonLibs.length == 0) {
			return [
				{
					channels: "",
					description: "",
					format: "",
					name: "",
					type: "",
					version: "",
					versions: ""
				}
			];
		}
		return JSON.parse(jsonLibs);
	}

	private getKraftLibVersion(lib: types.KraftLibType | undefined): string {
		let ret: string = ""
		if (typeof lib == "string") {
			ret = lib;
		} else if (typeof lib != 'undefined' && Object.keys(lib).includes('version')) {
			ret = lib.version
		}
		return ret;
	}

	private getData(lib: Library): Library[] {
		const details: string[] = Object.keys(lib.data);
		details.forEach((key, index) => {
			if (key as keyof types.ListDataType) {
				details[index] = key;
			}
		})
		return details.map((key) => {
			let data: string = ""
			data = typeof lib.data == 'string' ? lib.data : lib.data[key as keyof types.ListDataType];
			return new Library(
				key,
				data,
				false,
				false,
				data,
				(typeof data !== 'string') ?
					vscode.TreeItemCollapsibleState.Collapsed :
					vscode.TreeItemCollapsibleState.None,
				this.projectPath,
				this.kraftEnv
			)
		});
	}

	private toLib(
		lib: { meta: { name: string; }, data: types.ListDataType },
		kraftVersion: string,
		isInKraftYaml: boolean
	): Library {
		return new Library(
			lib.meta.name,
			kraftVersion,
			isInKraftYaml,
			this.isAvailableLocally(lib.meta.name, kraftVersion),
			lib.data,
			vscode.TreeItemCollapsibleState.Collapsed,
			this.projectPath,
			this.kraftEnv
		);
	}

	private isAvailableLocally(libName: string, kraftVersion: string): boolean {
		let fileExist = false;
		const sourcesFiles = readdirSync(this.sourcesDir)
		sourcesFiles.forEach((element: string) => {
			if (element.includes(libName) && element.includes(kraftVersion)) {
				fileExist = true;
			}
		})
		if (fileExist) {
			return true;
		}

		const libManifest = utils.getPkgManifest(libName);
		if (libManifest !== null) {
			libManifest.channels.forEach(
				(channel: types.LibManifestChannelType) => {
					if (channel.default && existsSync(channel.resource)) {
						fileExist = true;
					}
				}
			)
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
		const libManifest = utils.getPkgManifest(lib);
		if (libManifest == null) {
			return [];
		}
		const channelVersions: string[] = libManifest.channels.map(
			(channel: types.LibManifestChannelType) => channel["name"]
		).filter((str: string) => str.length > 0)

		const versions: string[] = libManifest.versions ?
			libManifest.versions.map(
				(dist: { version: string }) =>
					dist["version"]
			).filter((str: string) => str.length > 0) : [];
		return channelVersions.concat(versions);
	}
}

export class Library extends vscode.TreeItem {

	constructor(
		public readonly name: string,
		private _kraftVersion: string,
		private _isInKraftYaml: boolean,
		private readonly isAvailable: boolean,
		public readonly data: types.ListDataType | string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		private readonly projectPath: string | undefined,
		private readonly kraftEnv: types.KraftEnvType
	) {
		super(name, collapsibleState);

		this.tooltip = `${this.name}-${this._kraftVersion}`;
		this.description = this._kraftVersion;
		this.data = data;
	}

	iconPath = {
		light: join(__filename, '..', '..', '..', 'resources', 'light',
			this.getIconName()),
		dark: join(__filename, '..', '..', '..', 'resources', 'dark',
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
		kraftChannel: vscode.OutputChannel,
		kraftStatusBarItem: vscode.StatusBarItem,
		purge?: boolean
	) {
		kraftChannel.show(true);
		if (!this.projectPath) {
			utils.showErrorMessage(kraftChannel, kraftStatusBarItem, "No workspace found.")
			return;
		}

		const commands = []
		utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
			`Removing library ${this.name}...`
		)
		if (this._isInKraftYaml) {
			if (this.name == "unikraft") {
				utils.removeCore(kraftChannel, kraftStatusBarItem, this.projectPath);
				utils.refreshViews();
				kraftStatusBarItem.text = 'Unikraft';
			} else {
				commands.push(new Command(
					`kraft lib remove ${this.name}`,
					{ cwd: this.projectPath, env: this.kraftEnv },
					`Finished Removing ${this.name}:${this._kraftVersion}.`,
					() => {
						kraftStatusBarItem.text = 'Unikraft';
						utils.refreshViews();
						reloadIncludes(this.projectPath);
					}
				))
			}
		} else if (!purge) {
			utils.showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"Package not found in workdir."
			);
			return;
		}

		if (this.isAvailable && purge) {
			utils.showInfoMessage(kraftChannel, kraftStatusBarItem,
				`Purging library ${this.name}...`
			);
			commands.push(new Command(
				`kraft pkg prune ${this.name}:${this._kraftVersion}`,
				{ cwd: this.projectPath, env: this.kraftEnv },
				`Finished Pruning ${this.name}:${this._kraftVersion}.`,
				() => {
					kraftStatusBarItem.text = 'Unikraft';
					utils.refreshViews();
				}
			));
		} else if (purge) {
			utils.showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"Package not found on host machine."
			);
		}

		if (commands.length == 1) {
			commands[0].execute(kraftChannel, kraftStatusBarItem);
		} else if (commands.length > 1) {
			commands[0].execute(kraftChannel, kraftStatusBarItem, commands.slice(1));
		}
	}
}
