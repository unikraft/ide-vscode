import { ConfigurationTarget, workspace } from 'vscode';

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
