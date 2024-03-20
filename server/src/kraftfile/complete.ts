/* SPDX-License-Identifier: BSD-3-Clause */

import {
    TextDocumentPositionParams,
} from 'vscode-languageserver/node';

import { CompletionItem } from 'vscode-languageserver/node'
import { specificationCompletionItem } from './attributes/specification';
import { unikraftCompletionItem } from './attributes/unikraft';
import { architectureCompletionItem } from './attributes/architecture';
import { cmdCompletionItem } from './attributes/cmd';
import { kconfigCompletionItem } from './attributes/kconfig';
import { nameCompletionItem } from './attributes/name';
import { platformCompletionItem } from './attributes/platform';
import { sourceCompletionItem } from './attributes/source';
import { targetsCompletionItem } from './attributes/targets';
import { versionCompletionItem } from './attributes/version';
import { volumesCompletionItem } from './attributes/volume';
import { librariesCompletionItem } from './attributes/libraries';
import { rootfsCompletionItem } from './attributes/rootfs';
import { runtimeCompletionItem } from './attributes/runtime';
import { templateCompletionItem } from './attributes/template';
import { nameValueCompletionItem } from './values/name';
import { architectureValueCompletionItem } from './values/targets';
import { platformValueCompletionItem } from './values/targets';
import { getCurrentWordFromYamlFile } from '../utils';
import { targetsValueCompletionItem } from './values/targets';

export function kraftfileCompletionItems(currentUriText: string, workspaceDir: string, params: TextDocumentPositionParams): CompletionItem[] {
    let items: CompletionItem[] = [];
    const lines = currentUriText.split('\n');
    const lineStr = lines[params.position.line];
    let isValue: boolean = false;
    let isNested: boolean = false;
    let paretnAttribute: string = "";
    const rootAttrRegex = /(.+):( )(.*)/g;

    if (rootAttrRegex.test(lineStr)) {
        // This is certain that user wants to type a value for a Kraftfile field.
        isValue = true;
    } else if (params.position.line > 0 && lineStr.startsWith(" ")) {
        // Not sure, Whether user wants to type a value or an attribute.
        // e.g. it could be an attribute for `unikraft` block or value for `kconfig` block.
        // So, In this case extension will display completion items for both attributes & values.

        // It is certain that user wants to type a nested atrribute or value for another root attribute.
        let parentChar = -1;
        let lineStartInd = 0;
        for (; lineStr[lineStartInd] == " "; lineStartInd++);

        // Below code block doesn't work for lineStr.startsWith("- ")
        if (lineStartInd > 0) {
            // parentLine start Index must be less than `lineStartInd`.
            let parentLine: number = params.position.line - 1;
            for (; parentLine >= 0; parentLine--) {
                let j = 0;
                for (; j < lines[parentLine].length && (lines[parentLine][j] == " " || lines[parentLine][j] == "-"); j++);

                if (lines[parentLine].endsWith(":") && j < lineStartInd) {
                    parentChar = j;
                    break;
                }
            }

            if (parentChar > -1) {
                const temp = getCurrentWordFromYamlFile(parentChar, lines[parentLine]);
                if (temp) {
                    paretnAttribute = temp;
                    isNested = true;
                }
            }
        }
    }

    if (isValue) {
        // These items are nested or root field simple values as string or number.
        items = items.concat(architectureValueCompletionItem(lineStr));
        items = items.concat(platformValueCompletionItem(lineStr));
        items = items.concat(nameValueCompletionItem(lineStr, workspaceDir));
    } else if (isNested) {
        // These items are nested attributes.
        items = items.concat(architectureCompletionItem());
        items = items.concat(platformCompletionItem());
        items = items.concat(sourceCompletionItem());
        items = items.concat(versionCompletionItem());
        items = items.concat(kconfigCompletionItem());

        // When the root field is expressed as an array.
        // then elements of that array is treated as nested items. 
        items = items.concat(targetsValueCompletionItem(paretnAttribute));
    } else {
        // These items are root attributes.
        items = items.concat(cmdCompletionItem());
        items = items.concat(librariesCompletionItem());
        items = items.concat(nameCompletionItem());
        items = items.concat(specificationCompletionItem());
        items = items.concat(targetsCompletionItem());
        items = items.concat(unikraftCompletionItem());
        items = items.concat(volumesCompletionItem());
        items = items.concat(rootfsCompletionItem());
        items = items.concat(runtimeCompletionItem());
        items = items.concat(templateCompletionItem());
    }

    return items;
}
