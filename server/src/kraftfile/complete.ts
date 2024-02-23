/* SPDX-License-Identifier: BSD-3-Clause */

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

export function kraftfileCompletionItems(): CompletionItem[] {
    let items: CompletionItem[] = [];
    items = items.concat(architectureCompletionItem());
    items = items.concat(cmdCompletionItem());
    items = items.concat(kconfigCompletionItem());
    items = items.concat(librariesCompletionItem());
    items = items.concat(nameCompletionItem());
    items = items.concat(platformCompletionItem());
    items = items.concat(sourceCompletionItem());
    items = items.concat(specificationCompletionItem());
    items = items.concat(targetsCompletionItem());
    items = items.concat(unikraftCompletionItem());
    items = items.concat(versionCompletionItem());
    items = items.concat(volumesCompletionItem());
    items = items.concat(rootfsCompletionItem());
    items = items.concat(runtimeCompletionItem());
    items = items.concat(templateCompletionItem());
    return items;
}
