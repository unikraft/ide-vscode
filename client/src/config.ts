import { ConfigurationTarget, workspace } from 'vscode';
import { execSync } from "child_process";

// enableCCompletion set `enableCCompletion` to true if `C/C++ Extension` is not installed on the system.
export async function enableCCompletion() {
	let installedExts: string = "";

	// Try to fetch all the installed extension names on the system.
	installedExts = execSync('code --list-extensions').toString();

	// Checks, If `C/C++ Extension` (ID: ms-vscode.cpptools) provided by microsoft already exist.
	// If so, then update the workspace configuration with `enableCCompletion: false`
	// Otherwise, set it to `enableCCompletion: true` to enable server's custom headerfiles completion.
	let confUnikraft = workspace.getConfiguration().get("unikraft");
	if (confUnikraft === null || confUnikraft === undefined) {
		await workspace.getConfiguration().update("unikraft", {
			"enableCCompletion": !installedExts.includes("ms-vscode.cpptools")
		}, ConfigurationTarget.Workspace);
		confUnikraft = workspace.getConfiguration().get("unikraft");
	} else {
		confUnikraft["enableCCompletion"] = !installedExts.includes("ms-vscode.cpptools");
		await workspace.getConfiguration().update("unikraft", confUnikraft, ConfigurationTarget.Workspace);
	}
}

// provideDefaultConfigC checks & provide default configuations for c/c++.
export async function provideDefaultConfigC() {
	let confC = workspace.getConfiguration().get("C_Cpp");

	if (confC === null || confC === undefined) {
		await workspace.getConfiguration().update("C_Cpp", {
			"default": {
				"includePath": [],
				"defines": []
			}
		}, ConfigurationTarget.Workspace);
		confC = workspace.getConfiguration().get("C_Cpp");
	}
	if (!workspace.getConfiguration().has("C_Cpp.default")) {
		confC["default"] = {
			"includePath": [],
			"defines": []
		};
		await workspace.getConfiguration().update("C_Cpp", confC, ConfigurationTarget.Workspace);
		confC = workspace.getConfiguration().get("C_Cpp");
	}
	if (!workspace.getConfiguration().has("C_Cpp.default.includePath")) {
		confC["default"]["includePath"] = [];
		await workspace.getConfiguration().update("C_Cpp", confC, ConfigurationTarget.Workspace);
		confC = workspace.getConfiguration().get("C_Cpp");
	}
	if (!workspace.getConfiguration().has("C_Cpp.default.defines")) {
		confC["default"]["defines"] = [];
		await workspace.getConfiguration().update("C_Cpp", confC, ConfigurationTarget.Workspace);
		confC = workspace.getConfiguration().get("C_Cpp");
	}
}
