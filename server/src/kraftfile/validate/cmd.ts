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

export function validateCmd(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return []
    }

    let diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const alertPos = docText.indexOf("cmd");
    const emptyWarning = {
        severity: DiagnosticSeverity.Warning,
        range: {
            start: document.positionAt(alertPos),
            end: document.positionAt(alertPos + 3)
        },
        message: `Warning: Empty value.`,
        source: unikraftLanguageServer
    }

    if (typeof kraftfile.cmd == "string" && kraftfile.cmd.length === 0) {
        diagnostics.push(emptyWarning)
    } else if (kraftfile.cmd === null) {
        diagnostics.push(emptyWarning)
    }

    return diagnostics
}
