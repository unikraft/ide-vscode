/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'
import { unikraft } from '../../utils'
import { codeBlockStr, getInLineAttribute } from '../utils';

export function nameValueCompletionItem(lineStr: string, workspaceDir: string): CompletionItem[] {
    const attr: string | undefined = getInLineAttribute(lineStr);
    if (!attr || attr != "name") {
        return [];
    }

    const projectName: string = workspaceDir.slice(workspaceDir.lastIndexOf("/") + 1)

    return [
        {
            label: projectName,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: projectName,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "name: " + projectName + "\n" + codeBlockStr
            }
        }
    ];
}
