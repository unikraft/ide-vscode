/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
    MarkupContent,
    InsertTextFormat
} from 'vscode-languageserver/node'

import { HoverItem } from '../types';
import { codeBlockStr, getSpecVersions } from '../utils';
import { unikraft } from "../../utils";

const shortLabel: string = "spec";
const longLabel: string = "specification";

const detail: string = `All Kraftfiles MUST include a top-level specification attribute ` +
    `which is used by kraft to both validate as well as correctly parse the rest of the file. ` +
    `The latest spec number is v0.6.`;

const documentation: string = codeBlockStr +
    `spec: v0.6\n` +
    codeBlockStr +
    `For more visit: https://unikraft.org/docs/cli/reference/kraftfile/v0.6#top-level-spec-attribute`;

const markupDoc: MarkupContent = {
    kind: "markdown",
    value: documentation
};

export function specificationCompletionItem(): CompletionItem[] {
    const specVersions = getSpecVersions();
    return [
        {
            label: shortLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `spec: ${"${1|" + specVersions + "|}"}`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: markupDoc
        },
        {
            label: longLabel,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: `specification: ${"${1|" + specVersions + "|}"}`,
            insertTextFormat: InsertTextFormat.Snippet,
            kind: CompletionItemKind.Keyword,
            detail: detail,
            documentation: markupDoc,
            preselect: true,
        }
    ]
}

export function specificationHoverItem(): HoverItem[] {
    return [
        {
            label: shortLabel,
            detail: detail,
            documentation: documentation
        },
        {
            label: longLabel,
            detail: detail,
            documentation: documentation
        }
    ]
}
