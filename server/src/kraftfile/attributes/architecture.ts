/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const shortLabel: string = "arch";
const longLabel: string = "architecture";

const detail: string = `An architecture is specified for a target destination as an attribute of targets list element (e.g. x86_64 or arm64).`

const docShortLabel: string = `# The architecture and platform attributes can be abbreviated to arch and plat\n` +
    `targets:\n` +
    `  - plat: qemu\n` +
    `    arch: x86_64\n\n`;

const docLongLabel: string = `targets:\n` +
    `  - platform: xen\n` +
    `    architecture: arm64\n\n`;

const fullDoc: string = `Each target consists of at minimum an architecture and platform combination:\n\n` +
    codeBlockStr + docLongLabel + docShortLabel + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-targets-attributes`

export function architectureCompletionItem(): CompletionItem[] {
    return [
        {
            label: shortLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `arch: x86_64\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-target-arch',
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
            insertText: `architecture: x86_64\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-target-architecture',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongLabel + codeBlockStr
            }
        }
    ]
}

export function architectureHoverItem(): HoverItem[] {
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
