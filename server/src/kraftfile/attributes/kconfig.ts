/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "kconfig";

const detail: string = `It declares any specific options from Unikraft's configuration system, you must always use the long-hand syntax. ` +
    `All KConfig options start with CONFIG_ and can be set in either list format with key ` +
    `and value delimetered with an equal (=) symbol or in map format:`;

const docObject = `# Using map-style formatting for unikraft core\n` +
    `unikraft:\n` +
    `  kconfig:\n` +
    `    CONFIG_EXAMPLE: "y"\n\n` +
    `# Using map-style formatting for libraries\n` +
    `libraries:\n` +
    `  lwip:\n` +
    `    kconfig:\n` +
    `      CONFIG_EXAMPLE: "y"\n\n` +
    `# Using map-style formatting for targets\n` +
    `targets:\n` +
    `  - name: helloworld-qemu-x86_64-9pfs\n` +
    `    kconfig:\n` +
    `      CONFIG_EXAMPLE: "y"\n\n`;

const docArray = `# Using list-style formatting for unikraft core  \n` +
    `unikraft:\n` +
    `  kconfig:\n` +
    `    - CONFIG_EXAMPLE=y\n\n` +
    `# Using list-style formatting for libraries\n` +
    `libraries:\n` +
    `  lwip:\n` +
    `    kconfig:\n` +
    `      - CONFIG_EXAMPLE=y\n\n`;

const fullDoc: string = codeBlockStr + docObject + docArray + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#specifying-kconfig-configuration`;

export function kconfigCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " object",
                description: unikraft
            },
            insertText: `kconfig:\n` +
                `  CONFIG_EXAMPLE: "y"\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-kconfig-object',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docObject + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " array",
                description: unikraft
            },
            insertText: `kconfig:\n` +
                `  - CONFIG_EXAMPLE=y\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-kconfig-array',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docArray + codeBlockStr
            }
        }
    ]
}

export function kconfigHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
