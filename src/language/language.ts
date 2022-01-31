/* SPDX-License-Identifier: BSD-3-Clause */

import { setupCSupport } from "./c";
import { setupPythonSupport } from "./python";

export async function setupLangSupport(projectPath?: string) {
    setupCSupport(projectPath);
    setupPythonSupport(projectPath);
}
