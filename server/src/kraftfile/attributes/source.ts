/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "source";

const detail: string = `If you wish to use a copy of the Unikraft core or third party library code ` +
    `which is a remote fork or mirror, it is possible to set this as the entry for the attribute. ` +
    `When specified like so, the top of the HEAD of the default branch will be used.`;

const documentation: string = codeBlockStr +
    `# Short-hand syntax for unikraft core\n` +
    `unikraft: https://github.com/unikraft/unikraft.git\n\n` +
    `# Long-hand syntax for unikraft core\n` +
    `unikraft:\n` +
    `  source: https://github.com/unikraft/unikraft.git\n\n` +
    `# Short-hand syntax for libraries\n` +
    `libraries:\n` +
    `  lwip: https://github.com/unikraft/lib-lwip.git\n\n` +
    `# Long-hand syntax for libraries\n` +
    `libraries:\n` +
    `  lwip:\n` +
    `    source: https://github.com/unikraft/lib-lwip.git\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#setting-a-specific-source-location`;

export function sourceCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `source: https://github.com/SOURCE_URL\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-source',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: documentation
            }
        }
    ]
}

export function sourceHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: documentation
        },
    ]
}
