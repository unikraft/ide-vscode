/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr } from '../utils';
import { unikraft } from "../../utils";

const label: string = "runtime";

const detail: string = `The runtime attribute CAN be specified and is used to access a pre-built unikernel, ` +
    `The unikernel runtime can be specified either as a path to an OCI image, ` +
    `a directory representing a project (i.e. one which contains a Kraftfile) or a path to a unikernel binary image.`;

const documentation: string = codeBlockStr +
    `# For a high-level language runtime such as Python3, you can simply set the name of the image in the runtime element\n` +
    `runtime: unikraft.org/python3:latest\n\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-runtime-attribute`;

export function runtimeCompletionItem(): CompletionItem[] {
    return [
        {
            label: label,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `runtime: unikraft.org/python3:latest\n`,
            kind: CompletionItemKind.Keyword,
            data: 'kraftfile-runtime',
            detail: detail,
            documentation: {
                kind: "markdown",
                value: documentation
            }
        }
    ]
}

export function runtimeHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: documentation
        },
    ]
}
