/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "libraries";

const detail: string = `Additional third-party libraries CAN be specified as part of the build and are listed in map-format. ` +
    `Similar to the unikraft attribute, each library can specify a source, version and a set of kconfig options, ` +
    `for example:`;

const documentation: string = codeBlockStr +
    `libraries:\n` +
    `  # Short-hand syntax for specifying the library "musl" on the stable channel  \n` +
    `  musl: stable\n\n` +
    `  # Long-hand syntax for specifying a library at a specified source, using a\n` +
    `  # specific Git branch, and specifying additional KConfig options\n` +
    `  lwip:\n` +
    `    source: https://github.com/unikraft/lib-lwip.git\n` +
    `    version: stable\n` +
    `    kconfig:\n` +
    `      CONFIG_LWIP_AUTOIFACE: "y"\n` +
    `      CONFIG_LWIP_DHCP: "y"\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-libraries-attributes`;

export function librariesCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " object",
                description: unikraft
            },
            insertText: `libraries:\n` +
                `  nginx:\n` +
                `    version: stable\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-libraries',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: documentation
            }
        }
    ]
}

export function librariesHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: documentation
        },
    ]
}
