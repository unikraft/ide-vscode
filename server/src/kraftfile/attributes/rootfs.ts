/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "rootfs";

const detail: string = `The rootfs element CAN be specified to define the root filesystem, ` +
    `In every case of being specified, the resulting artifact which is passed to the unikernel machine instance is a read-only CPIO archive.`;

const documentation: string = codeBlockStr +
    `# Specifying an existing CPIO archive (initramfs file)\n` +
    `rootfs: ./initramfs.cpio\n\n` +
    `# Specifying a directory\n` +
    `rootfs: ./rootfs/\n\n` +
    `# Specifying a Dockerfile\n` +
    `rootfs: ./Dockerfile\n\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-rootfs-attribute`;

export function rootfsCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `rootfs: rel/abs/path/to\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-rootfs',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: documentation
            }
        }
    ]
}

export function rootfsHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: documentation
        },
    ]
}
