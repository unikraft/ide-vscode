/* SPDX-License-Identifier: BSD-3-Clause */

export interface HoverItem {
    label: string,
    detail: string,
    documentation: string
}

// A minimal Kraftfile type only for the attributes that are used by code.
export type KraftYamlType = {
    spec: string,
    specification: string,
    name: string,
    rootfs: string,
    runtime: string,
    unikraft: KraftLibType | undefined,
    template: string | {
        name: string
        version: string
    },
    volumes: [string] | [{
        source: string,
        destination: string,
        driver: string,
        readOnly: boolean
    }]
    libraries: {
        [key: string]: KraftLibType
    },
    cmd: string | [string]
    targets: [KraftTargetType]
} | undefined;

export type KraftLibType = {
    version: string,
    kconfig: KconfigType,
    source: string
} | string

export type KconfigType = {
    [key: string]: string
} | string[] | undefined;

export type KraftTargetType = {
    architecture: string,
    arch: string,
    platform: string,
    plat: string,
    kconfig: KconfigType
} | string;
