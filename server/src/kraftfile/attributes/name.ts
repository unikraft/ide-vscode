/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
    InsertTextFormat,
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr, getProjectDirName } from '../utils';
import { unikraft } from "../../utils";

const label: string = "name";

const detail: string = `An application name CAN specified. When no name attribute is specified, ` +
    `the directory's base name is used as the name.`;

const documentation: string = codeBlockStr +
    `name: helloworld\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-name-attribute`;

export function nameCompletionItem(workspacePath: string): CompletionItem[] {
    const projectDirName: string = getProjectDirName(workspacePath);

    return [
        {
            label: label,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `name: ${"${1:" + projectDirName + "}"}`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: {
                kind: "markdown",
                value: documentation
            },
        }
    ]
}

export function nameHoverItem(): HoverItem[] {
    return [
        {
            label: label,
            detail: detail,
            documentation: documentation
        },
    ]
}
