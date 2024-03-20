/* SPDX-License-Identifier: BSD-3-Clause */

import { Diagnostic } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { validateKraftfile } from './kraftfile/validate'

export const unikraft = "Unikraft";
export const unikraftLanguageServer = "Unikraft Language Server";

// getDefaultKraftfileNames() returns all the forms/names of the `Kraftfile` could be present in the user workspace.
export function getDefaultKraftfileNames(): string[] {
    return [
        "kraft.yaml",
        "kraft.yml",
        "Kraftfile.yml",
        "Kraftfile.yaml",
        "Kraftfile",
    ]
}

// validateFile() validates the files supported by extension.
export function validateFile(document: TextDocument): Diagnostic[] | undefined {
    const docUri = document.uri;
    switch (true) {
        case getDefaultKraftfileNames().includes(docUri.slice(docUri.lastIndexOf("/") + 1)):
            return validateKraftfile(document);
        default:
            break;
    }
}

// isKraftfile() Checks if the URI is pointing to `Kraftfile` file.
export function isKraftfile(uri: string): boolean {
    return getDefaultKraftfileNames().includes(uri.slice(uri.lastIndexOf("/") + 1))
}

// isCFile() Checks if the URI is pointing to a `C` relevant file.
export function isCFile(uri: string): boolean {
    return uri.endsWith('.c') || uri.endsWith('.cpp') || uri.endsWith('.h')
}

export function getCurrentWordFromYamlFile(char: number, lineStr: string): string | undefined {
    let word = getCurrentWord(char, lineStr)
    if (!word) {
        return;
    }

    if (word.endsWith(":")) {
        word = word.slice(0, word.length - 1)
    }
    return word;
}

// getCurrentWord() fetches the word user is dealing with at the current file line.
export function getCurrentWord(char: number, lineStr: string): string | undefined {
    if (lineStr == undefined) {
        return;
    }

    let i: number = 0;
    for (i = char; i >= 0 && lineStr[i] != " "; i--);
    const startInd = i + 1;
    for (i = char; i < lineStr.length && lineStr[i] != " "; i++);
    const lastInd = i;
    return lineStr.slice(startInd, lastInd);
}
