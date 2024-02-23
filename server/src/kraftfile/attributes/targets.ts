/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "targets";

const detail: string = `A target is defined as a specific destination that the resulting unikernel is destined for ` +
    `and consists at minimum of a specific platform (e.g. qemu or firecracker) and architecture (e.g. x86_64 or arm64) tuple. ` +
    `A project can have multiple targets depending on use case but MUST have at least one.`

const docShortHand: string = `# shorter syntax where only the architecture and platform are desired in the list\n` +
    `targets:\n` +
    `  - qemu/x86_64\n\n`;

const docLongHand: string = `# Within the list of targets, the architecture and platform attributes can be specified\n` +
    `targets:\n` +
    `  - platform: xen\n` +
    `    architecture: arm64\n\n`;

const docAllAtributes = `# It is possible to define targets simply based on different runtime properties or requirements\n` +
    `targets:\n` +
    `  - name: helloworld-qemu-x86_64\n` +
    `    platform: qemu\n` +
    `    architecture: x86_64\n` +
    `    kconfig:\n` +
    `      CONFIG_LIBVFSCORE_AUTOMOUNT_ROOTFS: "y"\n`;

const fullDoc: string = `Each target consists of at minimum an architecture and platform combination, ` +
    `therefore a project with two targets of qemu/x86_64 and xen/arm64:\n`
    + codeBlockStr + docShortHand + docLongHand + docAllAtributes + codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-targets-attributes`;


export function targetsCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " short-hand, array",
                description: unikraft
            },
            insertText: `targets:\n` +
                `  - qemu/x86_64\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-targets-short',
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
            insertText: `targets:\n` +
                `  - platform: qemu\n` +
                `    architecture: x86_64\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-targets-long',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docLongHand + codeBlockStr
            }
        },
        {
            label: label,
            labelDetails: {
                detail: " with all atributes, array",
                description: unikraft
            },
            insertText: `targets:\n` +
                `  - name: helloworld-qemu-x86_64\n` +
                `    platform: qemu\n` +
                `    architecture: x86_64\n` +
                `    kconfig:\n` +
                `      CONFIG_LIBVFSCORE_AUTOMOUNT_ROOTFS: "y"\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-targets-all-attributes',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + docAllAtributes + codeBlockStr
            }
        }
    ]
}

export function targetsHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: fullDoc
        },
    ]
}
