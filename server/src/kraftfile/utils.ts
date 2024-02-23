/* SPDX-License-Identifier: BSD-3-Clause */

export const codeBlockStr = `\`\`\`\n`;

export const minimalKraftfile =
    `spec: "v0.6"\n` +
    `name: helloworld\n` +
    `unikraft: stable\n` +
    `targets:\n` +
    `  - plat: qemu\n` +
    `    arch: x86_64\n`;
