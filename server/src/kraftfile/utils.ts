/* SPDX-License-Identifier: BSD-3-Clause */

import { getCurrentWordFromYamlFile } from "../utils";

export const codeBlockStr = `\`\`\`\n`;

export const minimalKraftfile =
    `spec: "v0.6"\n` +
    `name: helloworld\n` +
    `unikraft:\n` +
    `  version: stable\n` +
    `targets:\n` +
    `  - plat: qemu\n` +
    `    arch: x86_64\n`;

export const reTriggerCompletionCMD = {
    command: 'editor.action.triggerSuggest',
    title: 'Re-trigger completions...'
}

export function getInLineAttribute(lineStr: string): string | undefined {
    return getCurrentWordFromYamlFile(lineStr.indexOf(":") - 1, lineStr);
}
