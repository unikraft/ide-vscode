/* SPDX-License-Identifier: BSD-3-Clause */

export interface KraftYamlType {
    spec: string,
    specification: string,
    name: string,
    unikraft: KraftLibType | undefined,
    libraries: {
        [key: string]: KraftLibType
    },
    targets: [KraftTargetType]
}

export type KraftLibType = {
    version: string,
    kconfig: KconfigType
} | string

export type KconfigType = {
    [key: string]: string
} | string[] | undefined

export type KraftTargetType = {
    architecture: string,
    arch: string,
    platform: string,
    plat: string
} | string

export type KraftEnvType = NodeJS.ProcessEnv & {
    KRAFTKIT_PATHS_MANIFESTS: string;
    KRAFTKIT_PATHS_SOURCES: string;
    KRAFTKIT_NO_CHECK_UPDATES: boolean;
}

export type ListDataType = {
    channels: string,
    description: string,
    format: string,
    name: string,
    type: string,
    version: string,
    versions: string,
}

export interface LibManifestType {
    channels: [LibManifestChannelType],
    name: string,
    origin: string,
    provider: string,
    type: string,
    versions: []
}

export type LibManifestChannelType = {
    default: boolean,
    name: string,
    resource: string
}

export type LibManifestVersionType = {
    resource: string,
    type: string,
    unikraft: string,
    version: string
}
