/* SPDX-License-Identifier: BSD-3-Clause */

import {
	Event,
	EventEmitter,
	OutputChannel,
	StatusBarItem,
	TreeDataProvider,
	TreeItem,
	TreeItemCollapsibleState,
	window
} from 'vscode';
import {
	existsSync,
	readdirSync,
	writeFileSync
} from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import {
	getProjectPath,
	refreshViews,
	removeCore,
	getSourcesDir,
	getManifestsDir,
	showErrorMessage,
	getKraftYaml,
	getKraftYamlPath,
	removeCoreProjectDir,
	showInfoMessage,
	pkgExtractor,
	getPkgManifest
} from './commands/utils';
import { Command } from './commands/Command';
import { stringify as yamlStringify } from 'yaml';
import {
	KraftYamlType,
	KraftLibType,
	KraftEnvType,
	ListDataType
} from './types/types';

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
		if (kraftYaml == null) {
			window.showErrorMessage("could not fetch Kraftfile");
			return Promise.resolve([]);
		}
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
		let pullCommand;
		const options = { cwd: this.projectPath, env: this.kraftEnv };
		let core: Library[] = []
		let libs = this.getLibs();
		let jsonCore = execSync('kraft pkg list --log-type=json -C -o=json', { env: this.kraftEnv }).toString();
		jsonCore = pkgExtractor(jsonCore);
		if (jsonCore.length > 0) {
			core = JSON.parse(jsonCore)
				.map((core: ListDataType) =>
					this.toLib({ meta: { name: core.name }, data: core }, '', false));

		}
		// window.showInformationMessage("running AddLibrary inside")
		libs = libs.concat(core);
		const lib = await window.showQuickPick(
			libs.map(lib => lib.name),
			{ placeHolder: 'Choose the library' }
		);
		if (!lib) {
			return;
		}

		const versions: string[] = this.getLibVersions(lib);
		if (versions.length == 0) {
			showErrorMessage(
				kraftChannel,
				kraftStatusBarItem,
				"found 0 versions of the selected library"
			);
			return;
		}

		const version = await window.showQuickPick(
			versions,
			{ placeHolder: 'Choose the library version' }
		);
		if (!version) {
			return;
		}

		kraftChannel.show(true);
		if (lib.toLowerCase() == "unikraft") {
			removeCoreProjectDir(kraftChannel, kraftStatusBarItem, this.projectPath)
			pullCommand = new Command(
				`kraft pkg pull --log-type=basic ${lib}:${version}`,
				options,
				`Pulled ${lib} with ${version} version.`,
				refreshViews
			);

			const kraftYamlPath = getKraftYamlPath(this.projectPath);
			if (!kraftYamlPath) {
				showErrorMessage(kraftChannel, kraftStatusBarItem, "Kraftfile not found.")
				return;
			}
			const kraftYaml = getKraftYaml(this.projectPath)
			if (!kraftYaml.unikraft) {
				kraftYaml.unikraft = {
					version: version
				}
			} else {
				kraftYaml.unikraft.version = version
			}
			writeFileSync(kraftYamlPath, yamlStringify(kraftYaml))
		} else {
			pullCommand = new Command(
				`kraft lib add --log-type=basic ${lib}:${version}`,
				options,
				`Added ${lib} with ${version} version.`,
				refreshViews
			);
		}

		pullCommand.execute(kraftChannel, kraftStatusBarItem);
	}

	private getCore(kraftYaml: KraftYamlType): Library[] {
		let jsonCore = execSync('kraft pkg list --log-type=json -C -o=json', { env: this.kraftEnv }).toString()
		jsonCore = pkgExtractor(jsonCore);
		if (jsonCore.length == 0) {
			return [];
		}
		const core = JSON.parse(jsonCore)[0];
		const isInKraftYaml = Object.keys(kraftYaml).includes('unikraft');
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

	private getPresentLibs(kraftYaml: KraftYamlType): Library[] {
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

	private getKraftOnlyLibs(kraftYaml: KraftYamlType, kraftLibs: string[]): Library[] {
		return kraftLibs.map((lib: string) => new Library(
			lib,
			this.getKraftLibVersion(kraftYaml.libraries[lib]),
			true,
			this.isAvailableLocally(lib, this.getKraftLibVersion(kraftYaml.libraries[lib])),
			'',
			TreeItemCollapsibleState.None,
			this.projectPath,
			this.kraftEnv)
		);
	}

	private getLibs(): Library[] {
		const libs = this.listLibs().filter(lib => {
			if (lib.name.length > 0) {
				return lib;
			}
		}).map((lib: ListDataType) =>
			this.toLib({ meta: { name: lib.name }, data: lib }, '', false)
		).sort(this.compareLibs)

		return libs;
	}

	private listLibs(): [ListDataType] {
		let jsonLibs = execSync('kraft pkg list --log-type=json -L -o=json', { env: this.kraftEnv })
			.toString();
		jsonLibs = pkgExtractor(jsonLibs);
		if (jsonLibs.length == 0) {
			return [{ format: "", name: "", type: "", version: "" }];
		}
		return JSON.parse(jsonLibs);
	}

	private getKraftLibVersion(lib: KraftLibType): string {
		let ret: string = ""
		if (typeof lib == "string") {
			ret = lib;
		} else if (Object.keys(lib).includes('version')) {
			ret = lib.version
		}
		return ret;
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
		lib: { meta: { name: string; }, data: ListDataType },
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

		const libManifest = getPkgManifest(libName);
		if (libManifest !== null) {
			libManifest.channels.forEach(
				(channel: { default: boolean, name: string, resource: string }) => {
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
		const libManifest = getPkgManifest(lib);
		if (libManifest == null) {
			return [];
		}
		const channelVersions: string[] = libManifest.channels.map((channel:
			{ name: string }
		) =>
			channel["name"]
		).filter((str: string) => str.length > 0)

		const versions: string[] = libManifest.versions ?
			libManifest.versions.map(
				(dist: { version: string }) =>
					dist["version"]
			).filter((str: string) => str.length > 0) : [];
		return channelVersions.concat(versions);
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
		private readonly kraftEnv: KraftEnvType
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
				refreshViews();
			} else {
				commands.push(new Command(
					`kraft lib remove ${this.name}`,
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
