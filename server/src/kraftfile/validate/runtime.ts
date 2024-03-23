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

export function validateRuntime(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const alertPos = docText.indexOf("runtime");
    const emptyWarning = {
        severity: DiagnosticSeverity.Error,
        range: {
            start: document.positionAt(alertPos),
            end: document.positionAt(alertPos + 7)
        },
        message: `Error: Empty value.`,
        source: unikraftLanguageServer
    }

    if (kraftfile.runtime && typeof kraftfile.runtime == "string" && kraftfile.runtime.length === 0) {
        diagnostics.push(emptyWarning);
    } else if (kraftfile.runtime === null) {
        diagnostics.push(emptyWarning);
    }

    return diagnostics;
}
