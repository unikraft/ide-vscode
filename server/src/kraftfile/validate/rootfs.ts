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

export function validateRootfs(document: TextDocument, kraftfile: KraftYamlType): Diagnostic[] {
    if (!kraftfile) {
        return [];
    }

    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const alertPos = docText.indexOf("rootfs");
    const emptyWarning = {
        severity: DiagnosticSeverity.Warning,
        range: {
            start: document.positionAt(alertPos),
            end: document.positionAt(alertPos + 6)
        },
        message: `Warning: Empty value.`,
        source: unikraftLanguageServer
    }

    if (kraftfile.rootfs && typeof kraftfile.rootfs == "string" && kraftfile.rootfs.length === 0) {
        diagnostics.push(emptyWarning);
    } else if (kraftfile.rootfs === null) {
        diagnostics.push(emptyWarning);
    }

    return diagnostics;
}
