/* SPDX-License-Identifier: BSD-3-Clause */

import { Event, EventEmitter, OutputChannel, StatusBarItem, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window } from 'vscode';
import { existsSync, lstatSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { getProjectPath, getUkWorkdir, refreshViews } from './commands/utils';
import { Command } from './commands/Command';

const yaml = require('js-yaml');

export class ExternalLibrariesProvider implements TreeDataProvider<Library> {

	private _onDidChangeTreeData: EventEmitter<Library | undefined | void> = new EventEmitter<Library | undefined | void>();
	readonly onDidChangeTreeData: Event<Library | undefined | void> = this._onDidChangeTreeData.event;

	constructor(
		private projectPath: string | undefined,
		private _ukWorkdir: string | undefined) {
	}

	public get ukWorkdir(): string | undefined {
		return this._ukWorkdir;
	}
	public set ukWorkdir(value: string | undefined) {
		this._ukWorkdir = value;
		this.kraftEnv['UK_WORKDIR'] = value;
	}

	private kraftEnv = Object.assign(
		process.env,
		{ 'UK_WORKDIR': this._ukWorkdir }
	);

	refresh(): void {
		this.projectPath = getProjectPath();
		this.ukWorkdir = getUkWorkdir();
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Library): TreeItem {
		return element;
	}

	getChildren(element?: Library): Thenable<Library[]> {
		if (!this._ukWorkdir || !this.projectPath) {
			window.showInformationMessage('No library in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(this.getData(element));
		}

		const kraftYaml = this.getKraftYaml(
			join(this.projectPath, 'kraft.yaml')
		);
		const core = this.getCore(kraftYaml);
		const presentLibs = this.getPresentLibs(kraftYaml);

		return Promise.resolve(core.concat(presentLibs));
	}

	async addLibrary(
		kraftChannel: OutputChannel,
		kraftStatusBarItem: StatusBarItem
	) {
		if (!this.projectPath || !this._ukWorkdir) {
			return;
		}

		const options = { cwd: this.projectPath, env: this.kraftEnv };
		const libs = this.getLibs();

		const lib = await window.showQuickPick(
			libs.map(lib => lib.name),
			{ placeHolder: 'Choose the library' }
		);
		if (!lib) {
			return;
		}

		const version = await window.showQuickPick(
			this.getLibVersions(lib),
			{ placeHolder: 'Choose the library version' }
		);
		if (!version) {
			return;
		}

		const command = new Command(
			`kraft lib add ${lib}@${version.split('-')[1]}`,
			options,
			`Added ${lib}-${version} to the project.`
		);
		const pullCommand = new Command(
			`kraft list pull ${lib}@${version.split('-')[1]}`,
			options,
			`Pulled ${lib}-${version}.`,
			refreshViews
		);
	
		command.execute(kraftChannel, kraftStatusBarItem, [pullCommand]);
	}

	private getKraftYaml(kraftYamlPath: string): any {
		if (!existsSync(kraftYamlPath)) {
			return {};
		}

		return yaml.load(readFileSync(kraftYamlPath, 'utf-8'));
	}

	private getCore(kraftYaml: any): Library[] {
		const jsonCore = execSync('kraft list -c -j', { env: this.kraftEnv })
			.toString();

		const core = JSON.parse(jsonCore).unikraft[0];
		const isInKraftYaml = Object.keys(kraftYaml).includes('unikraft');

		return [this.toLib(
			core,
			isInKraftYaml ? this.getKraftVersion(kraftYaml.unikraft) : '',
			isInKraftYaml ? true : false
		)];
	}

	private getPresentLibs(kraftYaml: any): any {
		const rawLibs = this.listLibs();
		const kraftLibs = Object.keys(kraftYaml).includes('libraries') ?
			Object.keys(kraftYaml.libraries) : [];

		const libs = rawLibs.map(lib => {
			const libIndex = kraftLibs.indexOf(lib.meta.name);

			if (libIndex !== -1) {
				kraftLibs.splice(libIndex, 1);
			}

			return this.toLib(
				lib,
				libIndex !== -1 ?
					this.getKraftVersion(kraftYaml.libraries[lib.meta.name]) :
					'',
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
			this.isDirectory(lib),
			'',
			TreeItemCollapsibleState.None,
			this.projectPath,
			this.kraftEnv)
		);
	}

	private getLibs(): Library[] {
		const libs = this.listLibs()
			.map((lib: { meta: { name: any; }, data: { dists: {} } }) =>
				this.toLib(lib, '', false))
			.sort(this.compareLibs);

		return libs;
	}

	private listLibs(): [{ meta: { name: any; }, data: { dists: {} } }] {
		const jsonLibs = execSync('kraft list -l -j', { env: this.kraftEnv })
			.toString();

		return JSON.parse(jsonLibs).libraries;
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
		lib: { meta: { name: any; }, data: {} },
		kraftVersion: string,
		isInKraftYaml: boolean
	): Library {
		return new Library(
			lib.meta.name,
			kraftVersion,
			isInKraftYaml,
			this.isDirectory(lib.meta.name),
			lib.data,
			TreeItemCollapsibleState.Collapsed,
			this.projectPath,
			this.kraftEnv
		);
	};

	private isDirectory(libName: string): boolean {
		if (!this._ukWorkdir) {
			return false;
		}

		const libPath = libName === 'unikraft' ?
			join(this._ukWorkdir, libName) :
			join(this._ukWorkdir, 'libs', libName);

		return existsSync(libPath) && lstatSync(libPath).isDirectory();
	}

	private compareLibs(lib1: Library, lib2: Library): number {
		if (lib1.name < lib2.name) {
			return -1;
		}

		return 1;
	}

	private getLibVersions(lib: string): string[] {
		const libDetails = execSync(
					`kraft list show -j ${lib}`,
					{env: this.kraftEnv}
				).toString();
		const dists = JSON.parse(libDetails)[0].data.dists;
	
		return Object.keys(dists).map(dist =>
			Object.keys(dists[dist].data.versions)
			.map(version => `${dist}-${version}`))
			.flat();
	}
}

export class Library extends TreeItem {

	constructor(
		public readonly name: string,
		private _kraftVersion: string,
		private _isInKraftYaml: boolean,
		private readonly isDir: boolean,
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
		return this._isInKraftYaml || this.isDir;
	}

	private getIconName(): string {
		if (this._isInKraftYaml && this.isDir) {
			return 'lib_present.svg';
		}

		if (this._isInKraftYaml) {
			return 'lib_no_dir.svg';
		}

		if (this.isDir) {
			return 'lib_no_kraft.svg';
		}

		return '';
	}

	removeLibrary(
		kraftChannel: OutputChannel,
		kraftStatusBarItem: StatusBarItem,
		purge?: boolean
	) {
		if (!this.projectPath) {
			return;
		}

		kraftStatusBarItem.text = 'Removing library...';
		kraftChannel.appendLine(`Removing library ${this.name}...`);

		const command = new Command(
			`kraft lib remove ${purge ? '-P' : ''} ${this.name}`,
			{ cwd: this.projectPath, env: this.kraftEnv },
			`Removed ${this.name} from the project.`,
			refreshViews
		);

		command.execute(kraftChannel, kraftStatusBarItem);

		kraftStatusBarItem.text = 'Done removing library.';
		kraftChannel.appendLine(`Done removing library ${this.name}.`);
	}
}
