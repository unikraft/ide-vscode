/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr, minimalKraftfile } from '../utils';
import { unikraft } from "../../utils";

const label: string = "unikraft";

const detail: string = `The unikraft attribute MUST be specified and is used to define the source ` +
    `location of the Unikraft core which contains the main build system and ` +
    `core primitives for connecting your application as well as any third-party libraries or drivers.`;

const docLongHand: string = `# Long-hand syntax\n` +
    `unikraft:\n` +
    `  version: stable\n\n`;

const docShortHandSource: string = `# Short-hand syntax with source\n` +
    `unikraft: https://github.com/unikraft/unikraft.git\n\n`;

const docShortHandVersion: string = `# Short-hand syntax with version\n` +
    `unikraft: stable\n\n`;

const docAllAtributes: string = `# unikraft with all atributes\n` +
    `unikraft:\n` +
    `  source: https://github.com/unikraft/unikraft.git` +
    `  version: stable\n` +
    `  kconfig:\n` +
    `    CONFIG_EXAMPLE: "y"\n\n`;

const fullDoc: string = `The attribute can be specified in multiple ways, the most common is simply ` +
    `to request the latest from a "stable" channel of Unikraft, e.g.\n` + codeBlockStr + docShortHandVersion +
    docShortHandSource + docLongHand + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-unikraft-attribute`;

export function unikraftCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " only with version, string",
                description: unikraft
            },
            insertText: `unikraft: stable\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-unikraft-version-string',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docShortHandVersion + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " only with source url, string",
                description: unikraft
            },
            insertText: `unikraft: https://github.com/unikraft/unikraft.git\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-unikraft-url-string',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docShortHandSource + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " with only version, object",
                description: unikraft
            },
            insertText: `unikraft:\n` +
                `  version: stable\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-unikraft-version-attribute-object',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongHand + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " with all attributes, object",
                description: unikraft
            },
            insertText: `unikraft:\n` +
                `  source: https://github.com/unikraft/unikraft.git` +
                `  version: stable\n` +
                `  kconfig:\n` +
                `    CONFIG_EXAMPLE: "y"\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-unikraft-all-attributes-object',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docAllAtributes + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " kraftfile",
                description: unikraft
            },
            insertText: minimalKraftfile,
            kind: CompletionItemKind.Snippet,
            data: 'kraftfile-file',
            detail: `Kraftfile basic attributes.`,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + minimalKraftfile + codeBlockStr
            }
        }
    ]
}

export function unikraftHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
