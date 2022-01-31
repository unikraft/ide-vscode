/* SPDX-License-Identifier: BSD-3-Clause */

import { join } from 'path';
import { readdirSync, readFileSync, statSync } from "fs";

const yaml = require('js-yaml');

export function getLibFiles(projectPath: string, libsPath: string): string[] {
    return getKraftYamlLibs(projectPath)
        .map(lib => join(libsPath, lib));
}

export function getKraftYamlLibs(projectPath: string): string[] {
    const kraftYaml = yaml.load(
        readFileSync(join(projectPath, 'kraft.yaml'), 'utf-8'));
    const kraftLibs = Object.keys(kraftYaml).includes('libraries') ?
    Object.keys(kraftYaml.libraries) : [];

    return kraftLibs;
}

export function getAllFiles(dirPath: string): string[] {
    const files = readdirSync(dirPath);
    var includeFiles: string[] = [];

    files.forEach((file: string) => {
        const filePath = join(dirPath, file);
        if (file === 'include') {
            includeFiles.push(join(filePath, '**'));
        } else if (statSync(filePath).isDirectory()) {
            includeFiles = includeFiles.concat(getAllFiles(filePath));
        }
    })
  
    return includeFiles;
}
