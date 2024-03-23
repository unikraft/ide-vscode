/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
    InsertTextFormat,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr, getArchs } from '../utils';
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
    const archs = getArchs();
    const arch = `arch: ${"${1|" + archs + "|}"}`;
    const architecture = `architecture: ${"${1|" + archs + "|}"}`;
    return [
        {
            label: shortLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: arch,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docShortLabel + codeBlockStr
            },
        },
        {
            label: longLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: architecture,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongLabel + codeBlockStr
            },
            preselect: true,
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
