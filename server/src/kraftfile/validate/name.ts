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

export function validateName(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const alertPos = docText.indexOf("name");
    const emptyWarning = {
        severity: DiagnosticSeverity.Error,
        range: {
            start: document.positionAt(alertPos),
            end: document.positionAt(alertPos + 4)
        },
        message: `Error: Empty value.`,
        source: unikraftLanguageServer
    }

    if (typeof kraftfile.name == "string" && kraftfile.name.length === 0) {
        diagnostics.push(emptyWarning);
    } else if (kraftfile.name === null) {
        diagnostics.push(emptyWarning)
    }

    return diagnostics;
}
