/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "cmd";

const detail: string = `A cmd attribute CAN be specified as an array or string ` +
    `which can be used for setting default arguments to be used during ` +
    `the instantiation of a new unikernel instance.`;

const docString = `# Can be specified as a string\n` +
    `cmd: "-c /nginx/conf/nginx.conf"\n\n`;

const docInLineArray = `# Can be specified as a multi-line array\n` +
    `cmd: ["-c", "/nginx/conf/nginx.conf"]\n\n`;

const docMultiLineArray = `# Can be specified as a multi-line array\n` +
    `cmd:\n` +
    `  - -c\n` +
    `  - /nginx/conf/nginx.conf\n\n`;

const fullDoc: string = codeBlockStr + docString + docInLineArray + docMultiLineArray + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-cmd-attribute`;

export function cmdCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `cmd: "-c /nginx/conf/nginx.conf"\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-cmd-string',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docString + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " in-line array",
                description: unikraft
            },
            insertText: `cmd: ["-c", "/nginx/conf/nginx.conf"]\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-cmd-inline',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docInLineArray + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " multi-line array",
                description: unikraft
            },
            insertText: `cmd:\n` +
                `  - -c\n` +
                `  - /nginx/conf/nginx.conf\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-cmd-multiline',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docMultiLineArray + codeBlockStr
            }
        }
    ]
}

export function cmdHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
