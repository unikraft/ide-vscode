import { ExtensionContext } from 'vscode';
import { KraftExtension } from './KraftExtension';

export async function activate(context: ExtensionContext) {
	const kraftExtension = new KraftExtension(context);
	kraftExtension.activate();
}

export function deactivate() {}
