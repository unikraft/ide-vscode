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

export function validateSpecification(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const errMsg = `Error: Empty value.`;

    if (kraftfile.specification === null || (typeof kraftfile.specification == "string" && kraftfile.specification.length === 0)) {
        const alertPos = docText.indexOf("specification");
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(alertPos),
                end: document.positionAt(alertPos + 13)
            },
            message: errMsg,
            source: unikraftLanguageServer
        });
    }

    if (kraftfile.spec === null || (typeof kraftfile.spec == "string" && kraftfile.spec.length === 0)) {
        const alertPos = docText.indexOf("spec");
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(alertPos),
                end: document.positionAt(alertPos + 4)
            },
            message: errMsg,
            source: unikraftLanguageServer
        });
    }

    return diagnostics;
}
