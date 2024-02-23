/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { KraftYamlType } from '../types';
import { unikraftLanguageServer } from '../../utils';

export function validateUnikraft(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    let diagnostics: Diagnostic[] = [];
    let docTextLen = document.getText().trim().length;

    if (!kraftfile || !kraftfile.unikraft) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docTextLen + 1),
                end: document.positionAt(docTextLen + 2)
            },
            message: `Error: No 'unikraft' attribute is specified.`,
            source: unikraftLanguageServer
        });
    }

    return diagnostics
}
