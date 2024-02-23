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
    let diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const docTextLen = docText.trim().length;

    if (!kraftfile || kraftfile.targets === undefined) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docTextLen + 1),
                end: document.positionAt(docTextLen + 2)
            },
            message: `Error: 'targets' attribute is not specified.`,
            source: unikraftLanguageServer
        });
    } else if (kraftfile.targets === null) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docText.indexOf('targets')),
                end: document.positionAt(docText.indexOf('targets') + 7)
            },
            message: `Error: 'targets' attribute has no target specified.\n` +
                `The 'targets' attribute MUST have at least one target specified.`,
            source: unikraftLanguageServer
        });
    } else if (!Array.isArray(kraftfile.targets)) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docText.indexOf('targets')),
                end: document.positionAt(docText.indexOf('targets') + 7)
            },
            message: `Error: 'targets' attribute must be a list of 'target' objects.`,
            source: unikraftLanguageServer
        });
    } else if (kraftfile.targets.length > 0) {
        const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docText.indexOf('targets')),
                end: document.positionAt(docText.indexOf('targets') + 7)
            },
            message: `Error: Each 'target' consists of at minimum an architecture and platform combination`,
            source: unikraftLanguageServer
        };

        // Checks whether each element has arch & plat defined or not.
        kraftfile["targets"].forEach((target: KraftTargetType) => {
            if (typeof target === 'string') {
                if (!target.includes("/")) {
                    diagnostics.push(diagnostic);
                }
            } else if (
                target === null ||
                (!target.arch && !target.architecture) ||
                (!target.plat && !target.platform)
            ) {
                diagnostics.push(diagnostic);
            }
        });
    }

    return diagnostics
}
