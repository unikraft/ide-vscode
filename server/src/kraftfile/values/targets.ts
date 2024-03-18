/* SPDX-License-Identifier: BSD-3-Clause */

import {
    CompletionItemKind,
    CompletionItem,
} from 'vscode-languageserver/node'
import { unikraft } from '../../utils'
import { codeBlockStr, getInLineAttribute } from '../utils';

export function targetsValueCompletionItem(paretnAttribute: string): CompletionItem[] {
    if (paretnAttribute !== "targets") {
        return [];
    }

    const qemuX86 = "qemu/x86_64"
    const qemuArm64 = "qemu/arm64"
    const fcX86 = "firecracker/x86_64"
    const fcArm64 = "firecracker/arm64"
    const xenX86 = "xen/x86_64"
    const xenArm64 = "xen/arm64"

    return [
        {
            label: qemuX86,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: qemuX86,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    "targets:\n" +
                    "  - " + qemuX86 + "\n" +
                    codeBlockStr
            },
            sortText: "1",
            preselect: true
        },
        {
            label: qemuArm64,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: qemuArm64,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    "targets:\n" +
                    "  - " + qemuArm64 + "\n" +
                    codeBlockStr
            },
            sortText: "2",
            preselect: true
        },
        {
            label: fcX86,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: fcX86,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    "targets:\n" +
                    "  - " + fcX86 + "\n" +
                    codeBlockStr
            },
            sortText: "3",
            preselect: true
        },
        {
            label: fcArm64,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: fcArm64,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    "targets:\n" +
                    "  - " + fcArm64 + "\n" +
                    codeBlockStr
            },
            sortText: "4",
            preselect: true
        },
        {
            label: xenX86,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: xenX86,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    "targets:\n" +
                    "  - " + xenX86 + "\n" +
                    codeBlockStr
            },
            sortText: "5",
            preselect: true
        },
        {
            label: xenArm64,
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: xenArm64,
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr +
                    "targets:\n" +
                    "  - " + xenArm64 + "\n" +
                    codeBlockStr
            },
            sortText: "6",
            preselect: true
        }
    ];
}

export function architectureValueCompletionItem(lineStr: string): CompletionItem[] {
    let attr: string | undefined = getInLineAttribute(lineStr);
    if (!attr || attr != "arch" && attr != "architecture") {
        return [];
    }

    return [
        {
            label: "qemu",
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: "qemu",
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "arch: " + "qemu" + "\n" + codeBlockStr
            }
        },
        {
            label: "xen",
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: "xen",
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "arch: " + "xen" + "\n" + codeBlockStr
            }
        },
        {
            label: "firecracker",
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: "firecracker",
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "arch: " + "firecracker" + "\n" + codeBlockStr
            }
        },
    ];
}

export function platformValueCompletionItem(lineStr: string): CompletionItem[] {
    let attr: string | undefined = getInLineAttribute(lineStr);
    if (!attr || attr != "plat" && attr != "platform") {
        return [];
    }

    return [
        {
            label: "x86_64",
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: "x86_64",
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "plat: " + "x86_64" + "\n" + codeBlockStr
            }
        },
        {
            label: "arm64",
            labelDetails: {
                detail: " string",
                description: unikraft
            },
            insertText: "arm64",
            kind: CompletionItemKind.Value,
            documentation: {
                kind: "markdown",
                value: codeBlockStr + "plat: " + "arm64" + "\n" + codeBlockStr
            }
        }
    ];
}
