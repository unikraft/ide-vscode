/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
    MarkupContent
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "version";

const detail: string = `It specifies a specific version of Unikraft core or third party library, including a specific Git commit, ` +
    `you simply set it as follows:`

const documentation: string = codeBlockStr +
    `# Short-hand syntax for unikraft core\n` +
    `unikraft: v0.14.0\n\n` +
    `# Long-hand syntax for unikraft core\n` +
    `unikraft:\n` +
    `  version: v0.14.0\n\n` +
    `# Short-hand syntax for libraries\n` +
    `libraries:\n` +
    `  lwip: stable\n\n` +
    `# Long-hand syntax for libraries  \n` +
    `libraries:\n` +
    `  lwip:\n` +
    `    version: stable\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#setting-a-specific-version`

const markupDoc: MarkupContent = {
    kind: "markdown",
    value: documentation
};

export function versionCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `version: stable\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-version',
            detail: detail,
            documentation: markupDoc
        }
    ]
}

export function versionHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: documentation
        },
    ]
}
