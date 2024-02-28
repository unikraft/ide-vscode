/* SPDX-License-Identifier: BSD-3-Clause */

export interface UnikraftConfigType {
    enableCCompletion: boolean
    client: UnikraftClientConfigType
    server: UnikraftServerConfigType
}

// ClientConfigType can be updated in future as per needs.
export interface UnikraftClientConfigType {}

export interface UnikraftServerConfigType {
    maxNumberOfProblems: number
}
