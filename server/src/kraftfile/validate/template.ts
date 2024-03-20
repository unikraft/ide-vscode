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

export function validateTemplate(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const tempAlertPos = docText.indexOf("template");
    const warnMsg = `Warning: Empty value.`
    const emptyWarning = {
        severity: DiagnosticSeverity.Warning,
        range: {
            start: document.positionAt(tempAlertPos),
            end: document.positionAt(tempAlertPos + 8)
        },
        message: warnMsg,
        source: unikraftLanguageServer
    }

    if (typeof kraftfile.template == "string" && kraftfile.template.length === 0) {
        diagnostics.push(emptyWarning);
    } else if (typeof kraftfile.template == "object") {
        if (kraftfile.template === null) {
            diagnostics.push(emptyWarning);
        } else {
            if (kraftfile.template.name === null) {
                const alertPos = docText.indexOf("name", tempAlertPos);
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(alertPos),
                        end: document.positionAt(alertPos + 4)
                    },
                    message: warnMsg,
                    source: unikraftLanguageServer
                })
            }
            if (kraftfile.template.version === null) {
                const alertPos = docText.indexOf("version", tempAlertPos);
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(alertPos),
                        end: document.positionAt(alertPos + 7)
                    },
                    message: warnMsg,
                    source: unikraftLanguageServer
                })
            }
        }
    }

    return diagnostics;
}
