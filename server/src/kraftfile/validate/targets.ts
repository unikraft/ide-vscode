/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { KraftTargetType, KraftYamlType } from '../types';
import { unikraftLanguageServer } from '../../utils';

export function validateTargets(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const targetsAlertPos = docText.indexOf('targets');

    if (kraftfile.targets === null) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(targetsAlertPos),
                end: document.positionAt(targetsAlertPos + 7)
            },
            message: `Error: 'targets' attribute has no target specified.\n` +
                `The 'targets' attribute MUST have at least one target specified.`,
            source: unikraftLanguageServer
        });
    } else if (Array.isArray(kraftfile.targets)) {
        let lastElementPos = docText.indexOf("targets");

        // Checks whether each element has arch & plat defined or not.
        kraftfile["targets"].forEach((target: KraftTargetType) => {
            const currentElementPos = docText.indexOf("- ", lastElementPos + 1);
            lastElementPos = currentElementPos;

            if (typeof target === 'string' && !target.includes("/")) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: document.positionAt(currentElementPos),
                        end: document.positionAt(currentElementPos + target.length + 2)
                    },
                    message: `Error: Each 'target' consists of at minimum an architecture and platform combination separated by '/'`,
                    source: unikraftLanguageServer
                });
            } else if (typeof target == "object") {
                if (target === null || (target.arch === undefined && target.architecture === undefined) || (target.plat === undefined && target.platform === undefined)) {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        range: {
                            start: document.positionAt(currentElementPos),
                            end: document.positionAt(currentElementPos + 2)
                        },
                        message: `Error: Each 'target' consists of at minimum an architecture and platform combination`,
                        source: unikraftLanguageServer
                    });
                } else {
                    if (target.kconfig === null) {
                        const alertPos = docText.indexOf("kconfig", currentElementPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 7)
                            },
                            message: `Warning: Empty value.`,
                            source: unikraftLanguageServer
                        });
                    }

                    if (target.arch === null || (typeof target.arch == "string" && target.arch.length === 0)) {
                        const alertPos = docText.indexOf("arch:", currentElementPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 4)
                            },
                            message: `Error: Empty value.`,
                            source: unikraftLanguageServer
                        });
                    }

                    if (target.architecture === null || (typeof target.architecture == "string" && target.architecture.length === 0)) {
                        const alertPos = docText.indexOf("architecture", currentElementPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 12)
                            },
                            message: `Error: Empty value.`,
                            source: unikraftLanguageServer
                        });
                    }

                    if (target.plat === null || (typeof target.plat == "string" && target.plat.length === 0)) {
                        const alertPos = docText.indexOf("plat:", currentElementPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 4)
                            },
                            message: `Error: Empty value.`,
                            source: unikraftLanguageServer
                        });
                    }

                    if (target.platform === null || (typeof target.platform == "string" && target.platform.length === 0)) {
                        const alertPos = docText.indexOf("platform", currentElementPos);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: {
                                start: document.positionAt(alertPos),
                                end: document.positionAt(alertPos + 8)
                            },
                            message: `Error: Empty value.`,
                            source: unikraftLanguageServer
                        });
                    }
                }
            }
        });
    }

    return diagnostics
}
