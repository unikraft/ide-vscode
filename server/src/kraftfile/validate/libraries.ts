/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { KraftLibType, KraftYamlType } from '../types';
import { unikraftLanguageServer } from '../../utils';

export function validateLibraries(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const emptyWarning: string = `Warning: Empty value.`;

    if (typeof kraftfile.libraries == "object") {
        if (kraftfile.libraries === null) {
            const alertPos = docText.indexOf("libraries");
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: document.positionAt(alertPos),
                    end: document.positionAt(alertPos + 9)
                },
                message: emptyWarning,
                source: unikraftLanguageServer
            });
        } else {
            Object.keys(kraftfile.libraries).forEach(key => {
                const lib = kraftfile.libraries[key] as KraftLibType;
                if (typeof lib == "object" && lib !== null) {
                    const libPos = docText.indexOf(key);

                    if (lib.kconfig === null) {
                        const alertPos = docText.indexOf("kconfig", libPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 7)
                            },
                            message: emptyWarning,
                            source: unikraftLanguageServer
                        });
                    }

                    if (lib.source === null) {
                        const alertPos = docText.indexOf("source", libPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 6)
                            },
                            message: emptyWarning,
                            source: unikraftLanguageServer
                        });
                    }

                    if (lib.version === null) {
                        const alertPos = docText.indexOf("version", libPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 7)
                            },
                            message: emptyWarning,
                            source: unikraftLanguageServer
                        });
                    }
                }
            })
        }
    }

    return diagnostics
}
