import { ExtensionContext } from 'vscode';
import { UnikraftExtension } from './UnikraftExtension';

export async function activate(context: ExtensionContext) {
	const unikraftExtension = new UnikraftExtension(context);
	unikraftExtension.activate();
}

export function deactivate() {}
