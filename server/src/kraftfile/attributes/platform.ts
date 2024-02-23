/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const shortLabel: string = "plat";
const longLabel: string = "platform";

const detail: string = `A platform is specified for a target destination as an attribute of targets list element (e.g. qemu, xen etc).`;

const docShortLabel: string = `# The architecture and platform attributes can be abbreviated to arch and plat\n` +
    `targets:\n` +
    `  - plat: qemu\n` +
    `    arch: x86_64\n\n`;

const docLongLabel: string = `targets:\n` +
    `  - platform: xen\n` +
    `    architecture: arm64\n\n`;

const fullDoc: string = `Each target consists of at minimum an architecture and platform combination:\n` +
    codeBlockStr + docLongLabel + docShortLabel + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-targets-attributes`

export function platformCompletionItem(): CompletionItem[] {
    return [
        {
            label: shortLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `plat: qemu\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-target-plat',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docShortLabel + codeBlockStr
            }
        },
        {
            label: longLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `platform: qemu\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-target-platform',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongLabel + codeBlockStr
            }
        }
    ]
}

export function platformHoverItem(): HoverItem[] {
    return [
        {
            label: shortLabel,
            detail: detail,
            documentation: fullDoc
        },
        {
            label: longLabel,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
