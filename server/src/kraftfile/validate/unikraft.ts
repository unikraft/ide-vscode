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
    if (!kraftfile) {
        return []
    }

    const diagnostics: Diagnostic[] = [];
    const docText: string = document.getText();
    const warnMsg: string = `Warning: Empty value.`

    if (typeof kraftfile.unikraft == "object") {
        if (kraftfile.unikraft === null) {
            const alertPos = docText.indexOf("unikraft");
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: document.positionAt(alertPos),
                    end: document.positionAt(alertPos + 8)
                },
                message: warnMsg,
                source: unikraftLanguageServer
            });
        } else {
            if (kraftfile.unikraft.kconfig === null) {
                const alertPos = docText.indexOf("kconfig", docText.indexOf("unikraft"));
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(alertPos),
                        end: document.positionAt(alertPos + 7)
                    },
                    message: warnMsg,
                    source: unikraftLanguageServer
                });
            }

            if (kraftfile.unikraft.source === null) {
                const alertPos = docText.indexOf("source", docText.indexOf("unikraft"));
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(alertPos),
                        end: document.positionAt(alertPos + 6)
                    },
                    message: warnMsg,
                    source: unikraftLanguageServer
                });
            }

            if (kraftfile.unikraft.version === null) {
                const alertPos = docText.indexOf("version", docText.indexOf("unikraft"));
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(alertPos),
                        end: document.positionAt(alertPos + 7)
                    },
                    message: warnMsg,
                    source: unikraftLanguageServer
                });
            }
        }
    }

    return diagnostics
}
