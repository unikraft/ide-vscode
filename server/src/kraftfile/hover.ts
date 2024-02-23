/* SPDX-License-Identifier: BSD-3-Clause */

import { architectureHoverItem } from "./attributes/architecture";
import { cmdHoverItem } from "./attributes/cmd";
import { kconfigHoverItem } from "./attributes/kconfig";
import { librariesHoverItem } from "./attributes/libraries";
import { nameHoverItem } from "./attributes/name";
import { HoverItem } from "./types";
import { platformHoverItem } from "./attributes/platform";
import { sourceHoverItem } from "./attributes/source";
import { specificationHoverItem } from "./attributes/specification";
import { targetsHoverItem } from "./attributes/targets";
import { unikraftHoverItem } from "./attributes/unikraft";
import { versionHoverItem } from "./attributes/version";
import { volumesHoverItem } from "./attributes/volume";
import { getCurrentWordFromYamlFile } from '../utils'
import { rootfsHoverItem } from "./attributes/rootfs";
import { runtimeHoverItem } from "./attributes/runtime";
import { templateHoverItem } from "./attributes/template";

import {
    Hover,
    TextDocumentPositionParams,
    MarkupContent,
} from 'vscode-languageserver/node';

export function kraftfileHoverItems(): HoverItem[] {
    let items: HoverItem[] = []
    items = items.concat(architectureHoverItem());
    items = items.concat(cmdHoverItem());
    items = items.concat(kconfigHoverItem());
    items = items.concat(librariesHoverItem());
    items = items.concat(nameHoverItem());
    items = items.concat(platformHoverItem());
    items = items.concat(sourceHoverItem());
    items = items.concat(specificationHoverItem());
    items = items.concat(targetsHoverItem());
    items = items.concat(unikraftHoverItem());
    items = items.concat(versionHoverItem());
    items = items.concat(volumesHoverItem());
    items = items.concat(rootfsHoverItem());
    items = items.concat(runtimeHoverItem());
    items = items.concat(templateHoverItem());
    return items;
}

export function getKraftfileHoverItem(text: string, params: TextDocumentPositionParams): Hover | undefined {
    const lineStr = text.split('\n')[params.position.line]
    let elementVal: HoverItem = {
        label: "",
        detail: "",
        documentation: ""
    };

    // Checks, If hovering is done on a word or it is done on a commented out line.
    if (lineStr == undefined || lineStr.startsWith("#") || lineStr.length < params.position.character) {
        return;
    }

    const word = getCurrentWordFromYamlFile(params.position.character, lineStr);
    if (!word) {
        return
    }

    // Finds the hovered word in Kraftfile content.
    kraftfileHoverItems().forEach((element) => {
        if (element.label.replace(":", "") === word) {
            elementVal = element;
        }
    });

    if (elementVal.label.length > 0) {
        const content: MarkupContent = {
            kind: "markdown",
            value: `## \`${elementVal.label.replace(":", "")}\`  \n  \n` +
                `**${elementVal.detail}**  \n  \n` +
                `${elementVal.documentation} `,
        };

        return {
            contents: content,
        };
    }
    return
}
