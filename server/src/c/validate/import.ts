/* SPDX-License-Identifier: BSD-3-Clause */

import {
    Diagnostic,
    DiagnosticSeverity,
} from 'vscode-languageserver/node';

import {
    TextDocument
} from 'vscode-languageserver-textdocument';
import { unikraftLanguageServer } from '../../utils';

export function validateImports(document: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const docText = document.getText();
    const docTextLines = docText.split('\n');
    let importedStrs: {
        lineStr: string,
        lineNum: number
    }[] = [];

    docTextLines.forEach((lineStr, lineNum) => {
        lineStr = lineStr.trim();
        if (lineStr.startsWith("#include") && lineStr.includes(`"`)) {
            const firstInd = lineStr.indexOf(`"`);
            const lastInd = lineStr.lastIndexOf(`"`);
            if (lineStr.slice(firstInd + 1, lastInd) === "") {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: lineNum,
                            character: 0
                        },
                        end: {
                            line: lineNum,
                            character: docTextLines[lineNum].length
                        }
                    },
                    message: `Error: Empty inclusion`,
                    source: unikraftLanguageServer
                });
            } else {
                importedStrs.push({
                    lineStr: lineStr.slice(firstInd + 1, lastInd + 2),
                    lineNum: lineNum
                });
            }
        }
    })

    for (let i = 0; i < importedStrs.length; i++) {
        for (let j = i + 1; j < importedStrs.length; j++) {
            if (importedStrs[i].lineStr === importedStrs[j].lineStr) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: {
                            line: importedStrs[j].lineNum,
                            character: 0
                        },
                        end: {
                            line: importedStrs[j].lineNum,
                            character: docTextLines[importedStrs[j].lineNum].length
                        }
                    },
                    message: `Error: Repeated inclusion`,
                    source: unikraftLanguageServer
                });
            }
        }
    }
    return diagnostics;
}
