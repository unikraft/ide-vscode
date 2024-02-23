/* SPDX-License-Identifier: BSD-3-Clause */

export interface HoverItem {
    label: string,
    detail: string,
    documentation: string
};

// A minimal Kraftfile type only for the attributes that are used by code.
export type KraftYamlType = {
    spec: string,
    specification: string,
    name: string,
    unikraft: KraftLibType | undefined,
    libraries: {
        [key: string]: KraftLibType
    },
    targets: [KraftTargetType]
} | undefined;

export type KraftLibType = {
    version: string,
    kconfig: KconfigType
} | string

export type KconfigType = {
    [key: string]: string
} | string[] | undefined;

export type KraftTargetType = {
    architecture: string,
    arch: string,
    platform: string,
    plat: string
} | string;
