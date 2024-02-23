/* SPDX-License-Identifier: BSD-3-Clause */

import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';


export function readDirRecursively(path: string): string[] {
    let files: string[] = [];
    let dirContents = readdirSync(path);
    for (let i = 0; i < dirContents.length; i++) {
        let contentPath = join(path, dirContents[i]);
        if (lstatSync(contentPath).isDirectory()) {
            let tempItems = readDirRecursively(contentPath);
            files = files.concat(tempItems);
        } else {
            files.push(contentPath);
        }
    }
    return files;
}
