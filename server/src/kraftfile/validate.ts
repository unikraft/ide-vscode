/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver/node';
import * as yaml from 'js-yaml'

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { validateSpecification } from './validate/specification';
import { validateUnikraft } from './validate/unikraft';
import { validateTargets } from './validate/targets';
import { KraftYamlType } from './types';
import { unikraftLanguageServer } from '../utils';
import { validateCmd } from './validate/cmd';
import { validateLibraries } from './validate/libraries';
import { validateName } from './validate/name';
import { validateRootfs } from './validate/rootfs';
import { validateRuntime } from './validate/runtime';
import { validateTemplate } from './validate/template';
import { validateVolumes } from './validate/volumes';

export function validateKraftfile(document: TextDocument): Diagnostic[] {
    const docText: string = document.getText();
    let diagnostics: Diagnostic[] = [];
    let kraftfile: KraftYamlType;

    try {
        kraftfile = yaml.load(docText) as KraftYamlType;
    } catch (err) {
        const msg: string = err instanceof Error ? err.message : String(err);

        const diagnostic: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(docText.length + 1),
                end: document.positionAt(docText.length + 2)
            },
            message: msg,
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
    diagnostics = diagnostics.concat(validateCmd(document, kraftfile));
    diagnostics = diagnostics.concat(validateLibraries(document, kraftfile));
    diagnostics = diagnostics.concat(validateName(document, kraftfile));
    diagnostics = diagnostics.concat(validateRootfs(document, kraftfile));
    diagnostics = diagnostics.concat(validateRuntime(document, kraftfile));
    diagnostics = diagnostics.concat(validateTemplate(document, kraftfile));
    diagnostics = diagnostics.concat(validateVolumes(document, kraftfile));

    return diagnostics;
}
