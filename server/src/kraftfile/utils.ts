/* SPDX-License-Identifier: BSD-3-Clause */

import { getCurrentWordFromYamlFile } from "../utils";

export const codeBlockStr = `\`\`\`\n`;

// export const reTriggerCompletionCMD = {
//     command: 'editor.action.triggerSuggest',
//     title: 'Re-trigger completions...'
// }

export function getProjectDirName(workspaceDir: string): string {
    return workspaceDir.slice(workspaceDir.lastIndexOf("/") + 1);
}

export function getInLineAttribute(lineStr: string): string | undefined {
    return getCurrentWordFromYamlFile(lineStr.indexOf(":") - 1, lineStr);
}

export function getSpecVersions(): string {
    return "v0.6,v0.5";
}

export function getArchs(): string {
    return "x86_64,arm64";
}

export function getPlats(): string {
    return "qemu,xen,firecracker,kraftcloud";
}

export function getDefaultLibVersions(): string {
    return "stable,staging";
}
