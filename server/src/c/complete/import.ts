/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'
import { readDirRecursively } from '../utils';
import { unikraft } from '../../utils';

// importCompletionItems returns completionItems for importing files.
export function importCompletionItems(
    word: string,
    lineStr: string,
    uri: string,
    workspaceDir: string,
    includePath: string[]
): CompletionItem[] {
    let items: CompletionItem[] = [];

    if (
        includePath.length > 0 &&
        lineStr.startsWith("#include") &&
        word.startsWith(`"`) &&
        word.endsWith(`"`)
    ) {
        // fileDepthCounter counts the depth of the file user making changes to,
        // So that acurate relative path of the including headerfile can be provided.
        const docLocationInWorkdir = uri.slice(uri.lastIndexOf("//") + 1).replace(workspaceDir, "");
        const depthCount = docLocationInWorkdir.split('/').length - 2;
        let depth: string = '';
        for (let i = 0; i < depthCount; i++) {
            depth += '../';
        }

        includePath.forEach(path => {
            const files: string[] = readDirRecursively(path);
            files.forEach(file => {
                const fileName = file.slice(file.lastIndexOf("/") + 1);
                const filePath = file.replace(workspaceDir + "/", "");
                items = items.concat({
                    label: fileName,
                    labelDetails: {
                        description: unikraft
                    },
                    insertText: depth + filePath,
                    kind: CompletionItemKind.File,
                    data: path,
                    detail: depth + filePath,
                });
            });
        });
    } else if (word.startsWith("#")) {
        items.push(
            {
                label: "include",
                labelDetails: {
                    description: unikraft
                },
                insertText: `include `,
                kind: CompletionItemKind.Snippet,
                data: "#include",
                detail: "It is used to import header files in C.",
                documentation: `\`\`\`  \n` +
                    `#include "sample.h"  \n` +
                    `\`\`\``
            }
        );
    }

    return items
}
