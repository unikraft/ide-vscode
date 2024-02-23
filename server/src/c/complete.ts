/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItem,
    TextDocumentPositionParams
} from 'vscode-languageserver/node'

import { getCurrentWord } from '../utils';
import { importCompletionItems } from './complete/import';

export function cCompletionItems(
    currentUriText: string,
    params: TextDocumentPositionParams,
    workspaceDir: string,
    includePath: string[]
): CompletionItem[] {
    let items: CompletionItem[] = [];
    const lineStr = currentUriText.split('\n')[params.position.line].trim();
    const word = getCurrentWord(params.position.character, lineStr);
    if (!word) {
        return [];
    }

    items = items.concat(importCompletionItems(word, lineStr, params.textDocument.uri, workspaceDir, includePath));

    return items;
}
