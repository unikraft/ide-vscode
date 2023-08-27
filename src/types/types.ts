/* SPDX-License-Identifier: BSD-3-Clause */

export interface KraftYamlType {
    spec: string,
    specification: string,
    name: string,
    unikraft: KraftLibType,
    libraries: {
        [key: string]: KraftLibType
    },
    targets: [KraftTargetType]
}

export type KraftLibType = {
    version: string
} | string

export type KraftTargetType = {
    architecture: string
    platform: string
} | string

export type KraftEnvType = NodeJS.ProcessEnv & {
    KRAFTKIT_PATHS_MANIFESTS: string;
    KRAFTKIT_PATHS_SOURCES: string;
    KRAFTKIT_NO_CHECK_UPDATES: boolean;
}

export type ListDataType = {
    format: string,
    name: string,
    type: string,
    version: string
}
