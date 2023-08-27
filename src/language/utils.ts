/* SPDX-License-Identifier: BSD-3-Clause */

import { join } from 'path';
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import * as utils from './../commands/utils';
import { load as yamlLoad } from 'js-yaml';

export function getLibFiles(projectPath: string, libsPath: string): string[] {
    return getKraftYamlLibs(projectPath)
        .map(lib => join(libsPath, lib));
}

export function getKraftYamlLibs(projectPath: string): string[] {
    let kraftYamlPath = "";
    utils.getDefaultFileNames().forEach(element => {
        const temPath = join(projectPath, element)
        if (existsSync(temPath)) {
            kraftYamlPath = temPath
        }
    });
    const kraftYaml: any = yamlLoad(readFileSync(join(kraftYamlPath), 'utf-8'));
    const kraftLibs = Object.keys(kraftYaml).includes('libraries') ?
    Object.keys(kraftYaml.libraries) : [];

    return kraftLibs;
}

export function getAllFiles(dirPath: string): string[] {
    const files = readdirSync(dirPath);
    let includeFiles: string[] = [];

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
