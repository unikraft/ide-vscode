/* SPDX-License-Identifier: BSD-3-Clause */

import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';


export function readDirRecursively(path: string): string[] {
    let files: string[] = [];
    const dirContents = readdirSync(path);
    for (let i = 0; i < dirContents.length; i++) {
        const contentPath = join(path, dirContents[i]);
        if (lstatSync(contentPath).isDirectory()) {
            const tempItems = readDirRecursively(contentPath);
            files = files.concat(tempItems);
        } else {
            files.push(contentPath);
        }
    }
    return files;
}
