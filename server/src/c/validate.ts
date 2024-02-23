/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { validateImports } from './validate/import';

export function validateC(document: TextDocument): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];

    diagnostics = diagnostics.concat(validateImports(document))

    return diagnostics
}
