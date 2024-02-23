/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "volumes";

const detail: string = `A volumes attribute CAN be specified to declare the list of runtime mounts ` +
    `which are provided to the unikernel machine instance.`;

const docShortHand = `# Short-hand syntax\n` +
    `volumes:\n` +
    `  - ./src:/dest\n\n`;

const docLongHand = `# Long-hand syntax\n` +
    `volumes:\n` +
    `  - source: ./src\n` +
    `    destination: /dest\n\n`;

const docAllAtributes = `# With all atributes\n` +
    `volumes:\n` +
    `  - source: ./src\n` +
    `    destination: /dest\n` +
    `    driver: 9pfs\n` +
    `    readOnly: false\n\n`;

const fullDoc: string = codeBlockStr + docShortHand + docLongHand + docAllAtributes + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-volumes-attribute`;

export function volumesCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " short-hand, array",
                description: unikraft
            },
            insertText: `volumes:\n` +
                `  - ./src:/dest\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-volumes-short',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docShortHand + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " long-hand, array",
                description: unikraft
            },
            insertText: `volumes:\n` +
                `  - source: ./src\n` +
                `    destination: /dest\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-volumes-long',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongHand + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " with all atrributes, array",
                description: unikraft
            },
            insertText: `volumes:\n` +
                `  - source: ./src\n` +
                `    destination: /dest\n` +
                `    driver: 9pfs\n` +
                `    readOnly: false\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-volumes-all-attributes',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docAllAtributes + codeBlockStr
            }
        }
    ]
}

export function volumesHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
