/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver/node';
const yaml = require('js-yaml');

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { validateSpecification } from './validate/specification';
import { validateUnikraft } from './validate/unikraft';
import { validateTargets } from './validate/targets';
import { KraftYamlType } from './types';
import { unikraftLanguageServer } from '../utils';

export function validateKraftfile(document: TextDocument): Diagnostic[] {
    const docText: string = document.getText().trim();
    let diagnostics: Diagnostic[] = [];
    let kraftfile: KraftYamlType;

    try {
        kraftfile = yaml.load(docText);
    } catch (err: any) {
        const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docText.length + 1),
                end: document.positionAt(docText.length + 2)
            },
            message: err.message,
            source: unikraftLanguageServer
        };
        diagnostics.push(diagnostic);
        return diagnostics;
    }

    if (kraftfile == undefined || kraftfile == null) {
        kraftfile = undefined;
    }

    diagnostics = diagnostics.concat(validateSpecification(document, kraftfile));
    diagnostics = diagnostics.concat(validateUnikraft(document, kraftfile));
    diagnostics = diagnostics.concat(validateTargets(document, kraftfile));

    return diagnostics;
}
