/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr, reTriggerCompletionCMD } from '../utils';
import { unikraft } from "../../utils";

const label: string = "template";

const detail: string = `The template attribute CAN be specified to ` +
    `reference an external repository which contains an application based on another Kraftfile.`;

const docShortHand = `# Short-hand syntax\n` +
    `template: app/elfloader:stable\n\n` +
    `# As a remote Git repository:\n` +
    `template: https://github.com/unikraft/app-elfloader.git\n\n` +
    `# As a tarball representing an application repository:\n` +
    `template: https://github.com/unikraft/app-elfloader/archive/refs/heads/stable.tar.gz\n\n` +
    `# Or as a directory on your host representing an application:\n` +
    `template: https://github.com/unikraft/app-elfloader.git\n\n`;

const docLongHand = `# Long-hand syntax\n` +
    `template:\n` +
    `  name: elfloader\n` +
    `  version: stable\n\n`;

const fullDoc: string = codeBlockStr + docShortHand + docLongHand + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-template-attribute`;

export function templateCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " short-hand, string",
                description: unikraft
            },
            insertText: `template: \n`,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docShortHand + codeBlockStr
            },
            preselect: true,
            command: reTriggerCompletionCMD
        },
        {
            label: label,
            labelDetails: {
                detail: " long-hand, object",
                description: unikraft
            },
            insertText: `template:\n` +
                `  name: \n` +
                `  version: \n`,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongHand + codeBlockStr
            },
            command: reTriggerCompletionCMD
        }
    ]
}

export function templateHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
