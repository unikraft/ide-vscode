/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
    InsertTextFormat,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr, getArchs, getDefaultLibVersions, getPlats, getProjectDirName, getSpecVersions } from '../utils';
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

export function unikraftCompletionItem(workspacePath: string): CompletionItem[] {
    const specVersions = getSpecVersions();
    const versions = getDefaultLibVersions();
    const archs = getArchs();
    const plats = getPlats();
    const projectDirName: string = getProjectDirName(workspacePath);

    return [
        {
            label: label,
            labelDetails: {
                detail: " only with version, string",
                description: unikraft
            },
            insertText: `unikraft: ${"${1|" + versions + "|}"}`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
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
            insertText: 'unikraft: ${1:https://github.com/unikraft/unikraft.git}',
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
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
                `  version: ${"${1|" + versions + "|}"}`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongHand + codeBlockStr
            },
            preselect: true
        },
        {
            label: label,
            labelDetails: {
                detail: " with all attributes, object",
                description: unikraft
            },
            insertText: `unikraft:\n` +
                '  source: ${1:https://github.com/unikraft/unikraft.git}\n' +
                `  version: ${"${2|" + versions + "|}"}\n` +
                `  kconfig:\n` +
                `    `,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
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
            insertText: `spec: ${"${1|" + specVersions + "|}"}\n` +
                `name: ${"${2|" + projectDirName + "|}"}\n` +
                `unikraft:\n` +
                `  version: ${"${3|" + versions + "|}"}\n` +
                `targets:\n` +
                `  - plat: ${"${4|" + plats + "|}"}\n` +
                `    arch: ${"${5|" + archs + "|}"}\n`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Snippet,
            detail: `Kraftfile basic attributes.`,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    `spec: "v0.6"\n` +
                    `name: ${projectDirName}\n` +
                    `unikraft:\n` +
                    `  version: stable\n` +
                    `targets:\n` +
                    `  - plat: qemu\n` +
                    `    arch: x86_64\n` +
                    codeBlockStr
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
