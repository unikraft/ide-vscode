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

export function validateVolumes(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const volumesAlertPos = docText.indexOf("volumes");
    const errMsg = `Error: Empty value.`;

    if (typeof kraftfile.volumes == "object") {
        if (kraftfile.volumes === null) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: document.positionAt(volumesAlertPos),
                    end: document.positionAt(volumesAlertPos + 7)
                },
                message: errMsg,
                source: unikraftLanguageServer
            })
        } else {
            let lastElementPos: number = volumesAlertPos
            kraftfile.volumes.forEach((volume) => {
                const currentElementPos = docText.indexOf("- ", lastElementPos + 1);
                lastElementPos = currentElementPos;

                if (typeof volume === 'string' && !volume.includes(":")) {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        range: {
                            start: document.positionAt(currentElementPos),
                            end: document.positionAt(currentElementPos + volume.length + 2)
                        },
                        message: "source & destination must be separated by `:`",
                        source: unikraftLanguageServer
                    });
                } else if (typeof volume == "object") {
                    if (volume === null) {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: {
                                start: document.positionAt(currentElementPos),
                                end: document.positionAt(currentElementPos + 2)
                            },
                            message: errMsg,
                            source: unikraftLanguageServer
                        });
                    } else {
                        if (volume.destination === null) {
                            const alertPos = docText.indexOf("destination", currentElementPos);
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: {
                                    start: document.positionAt(alertPos),
                                    end: document.positionAt(alertPos + 11)
                                },
                                message: errMsg,
                                source: unikraftLanguageServer
                            });
                        }

                        if (volume.driver === null) {
                            const alertPos = docText.indexOf("driver", currentElementPos);
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: {
                                    start: document.positionAt(alertPos),
                                    end: document.positionAt(alertPos + 6)
                                },
                                message: errMsg,
                                source: unikraftLanguageServer
                            });
                        }

                        if (volume.source === null) {
                            const alertPos = docText.indexOf("source", currentElementPos);
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: {
                                    start: document.positionAt(alertPos),
                                    end: document.positionAt(alertPos + 6)
                                },
                                message: errMsg,
                                source: unikraftLanguageServer
                            });
                        }

                        if (volume.readOnly === null) {
                            const alertPos = docText.indexOf("readOnly", currentElementPos);
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: {
                                    start: document.positionAt(alertPos),
                                    end: document.positionAt(alertPos + 8)
                                },
                                message: errMsg,
                                source: unikraftLanguageServer
                            });
                        }
                    }
                }
            });
        }
    }

    return diagnostics;
}
