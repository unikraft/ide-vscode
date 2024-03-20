/* SPDX-License-Identifier: BSD-3-Clause */

import { ExtensionContext, workspace } from 'vscode';
import { UnikraftExtension } from './UnikraftExtension';
import { join } from 'path';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
	const unikraftExtension = new UnikraftExtension(context);
	await unikraftExtension.activate();

	// **************Language Server activation code below**************

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		join('server', 'out', 'server.js')
	);

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server to listen for the following file types documents.
		documentSelector: [
			// { scheme: 'file', language: 'plaintext' },
			{ pattern: '*.y(a)ml' },
			{ scheme: 'file', language: 'yaml' },
		],
		synchronize: {
			// Notify the server about file changes to '.clientrc' files contained in the workspace.
			// `**/.clientrc` is an example file, Below `**/.clientrc` file can be replaced with other filename
			// that will be useful for `Kraftkit or Unikraft` in future.
			fileEvents: [
				workspace.createFileSystemWatcher('**/.clientrc')
			]
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'UnikraftLanguageServer',
		'Unikraft Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
