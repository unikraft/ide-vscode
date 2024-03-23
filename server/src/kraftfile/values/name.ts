/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'
import { unikraft } from '../../utils'
import { codeBlockStr, getInLineAttribute, getProjectDirName } from '../utils';

export function nameValueCompletionItem(lineStr: string, workspacePath: string): CompletionItem[] {
    const attr: string | undefined = getInLineAttribute(lineStr);
    if (!attr || attr != "name") {
        return [];
    }

    const projectDirName: string = getProjectDirName(workspacePath);

    return [
        {
            label: projectDirName,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: projectDirName,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "name: " + projectDirName + "\n" + codeBlockStr
            }
        }
    ];
}
