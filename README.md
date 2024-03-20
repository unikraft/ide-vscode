# Unikraft VSCode Extension

The Unikraft VSCode Extension extension facilitates the development of Unikraft applications and libraries (both external and internal).

![helloworld](https://github.com/unikraft/ide-vscode/blob/prototype/media/helloworld.gif)

## Features

### Project initialization

The command `Unikraft: Initialize project` from the command palette allows creating a new project in the opened directory. It can create the following project types:

<!-- #### Application

An application can either be created from an existing template or it can be a blank one.

An application can have 2 layouts:
- the Unikraft hierarchy will be in `./.unikraft`, whereas the application source code will be in the opened directory;
- the application source code will be in the opened directory, but the Unikraft hierarchy will be in `~/.unikraft`. -->

#### Library

The user has to provide the extension with the following information in order to initialize a library:
* path (where to create library).
* library name
* origin
* version
* author name
* author email.

The Unikraft hierarchy will be in `./.unikraft`, the library source code will be in `./unikraft/libs/$lib_name`, whereas the application for testing the library will be in the opened directory.

![Creating library](https://github.com/unikraft/ide-vscode/blob/main/media/creating-library.gif)

### Project configuration

The command `Unikraft: Configure project` from the command palette allows configuring the project interactively by opening a terminal with `menu`.

### Project building

The command `Unikraft: Build project` from the command palette builds the unikernel based on the configuration file.

![Building project](https://github.com/unikraft/ide-vscode/blob/main/media/building.gif)

### Project running

The command `Unikraft: Run project` from the command palette runs the built unikernel in a new terminal.

If there are multiple images, the user has to choose one of them.

![Running project](https://github.com/unikraft/ide-vscode/blob/main/media/running.gif)

### Project cleaning

The command `Unikraft: Clean` from the command palette clean a built project.

![Cleaning project](https://github.com/unikraft/ide-vscode/blob/main/media/cleaning.gif)

### Project propercleaning

The command `Unikraft: Properclean` from the command palette cleans a built project fully.

![Propercleaning project](https://github.com/unikraft/ide-vscode/blob/main/media/proper-cleaning.gif)

### Project deploying

The command `Unikraft: Deploy to KraftCloud` from the command palette deploys a project on the KraftCloud platform.

![Deploying project](https://github.com/unikraft/ide-vscode/blob/main/media/deploying.gif)

### External dependencies inspection

The `External libraries` view allows inspecting various types of external libraries:
* the ones that are specified in `kraft.yaml` and are also present in the project hierarchy (represented with U icon);
* the ones that are only specified in `kraft.yaml` (represented with red icon);
* the ones that are only present in the project hierarchy (represented with green icon).

![libs](https://github.com/unikraft/ide-vscode/blob/prototype/media/libs.gif)

A new library and core can be added to the project from this view by clicking the `+` button and selecting the library and its version from a drop-down list.

A library can either be removed from the project (it will still be stored on disk) or purged by clicking right on it.

### Removing and purging external libraries

![Removing & purging libraries](https://github.com/unikraft/ide-vscode/blob/main/media/removing-purging-library.gif)

### Intellisense

At the moment, this is possible only for C and Python applications.
This feature is based on the C/C++ and Python extensions from Microsoft.

#### C

The paths to the included headers are automatically added in the `C_Cpp.default.includePath` field from the `settings.json` file.

The following options are also automatically added:
- `"C_Cpp.default.intelliSenseMode": "linux-gcc-x64"`
- `"C_Cpp.default.compilerArgs": ["-nostdinc"]`
- `"C_Cpp.default.compilerPath": "/usr/bin/gcc"`

#### Python

A `.env` file is created and it contains the path to the Python source code. However, VSCode has to be restarted when the file is modified.

## Requirements

The following packages are required for `kraft` and these are automatically installed with `Kraft` if not installed on this system:

* bison
* build-essential
* flex
* git
* libncurses-dev
* qemu-system
* socat
* unzip
* wget

The CLI `kraft` can be installed via:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://get.kraftkit.sh | sh
```

This extension also depends on the other extensions provided by microsoft,
Please to have full capabilities of this extension also enable them in your vscode IDE, They are as follows:

* [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
* [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

## Extension Settings

This extension contributes the following settings:

**Kraftkit path configurations**
* `unikraft.sources`: Sets the environment variable `KRAFTKIT_PATHS_SOURCES` by default set by `~/.config/kraftkit/config.yaml` or ENV `KRAFTKIT_PATHS_SOURCES` that is further used by extension for `kraft` commands.
* `unikraft.manifests`: Sets the environment variable `KRAFTKIT_PATHS_MANIFESTS` by default set by `~/.config/kraftkit/config.yaml` or ENV `KRAFTKIT_PATHS_MANIFESTS` that is further used by extension for `kraft` commands.

**Run command configurations**
* `unikraft.run.detach`: Whether to run unikernel in background (default is False).
* `unikraft.run.disableAccel`: Whether to disable acceleration of CPU (usually enables TCG) when running `kraft run` (default is False).
* `unikraft.run.initrd`: Whether to use the specified path as an initrd.
* `unikraft.run.ip`: Assign the provided IP address when running `kraft run`.
* `unikraft.run.kernelArguments`: Sets additional kernel arguments.
* `unikraft.run.macAddress`: Assign the provided MAC address.
* `unikraft.run.memory`: Assign memory to the unikernel when running (default is 64M).
* `unikraft.run.name`: Name of the instance.
* `unikraft.run.network`: Attach instance to the provided network in the format `<driver>:<network>` when running `kraft run`.
* `unikraft.run.ports`: Publish a machine's port(s) to the host (An array of strings e.g ["8080"]) when running `kraft run`.
* `unikraft.run.remove`: Whether to automatically remove the unikernel when it shutsdown (default is False).
* `unikraft.run.as`: Force a specific runner.
* `unikraft.run.volume`: Bind a volume to the instance.
* `unikraft.run.symbolic`: Whether to use the debuggable (symbolic) unikernel when running `kraft run` (default is False).

**Build command configurations**
* `unikraft.build.config`: Override the path to the KConfig .config file.
* `unikraft.build.jobs`:  Allow N jobs at once (default is 0).
* `unikraft.build.dbg`: Build the debuggable (symbolic) kernel image instead of the stripped image (default is False).
* `unikraft.build.noCache`: Force a rebuild even if existing intermediate artifacts already exist (default is False).
* `unikraft.build.noConfigure`: Do not run Unikraft's configure step before building (default is False).
* `unikraft.build.noFast`: Do not use maximum parallelization when performing the build (default is False).
* `unikraft.build.noFetch`: Do not run Unikraft's fetch step before building (default is False).
* `unikraft.build.forcePull`: Force pulling packages before building (default is False).
* `unikraft.build.noUpdate`: Do not update package index before running the build (default is False).
* `unikraft.build.buildLog`: Use the specified file to save the output from the build.

**Deploy command configurations**
* `unikraft.deploy.config`: Override the path to the KConfig .config file.
* `unikraft.deploy.jobs`:  Allow N jobs at once (default is 0).
* `unikraft.deploy.dbg`: Build the debuggable (symbolic) kernel image instead of the stripped image (default is False).
* `unikraft.deploy.noCache`: Force a rebuild even if existing intermediate artifacts already exist (default is False).
* `unikraft.deploy.noConfigure`: Do not run Unikraft's configure step before building (default is False).
* `unikraft.deploy.noFast`: Do not use maximum parallelization when performing the build (default is False).
* `unikraft.deploy.noFetch`: Do not run Unikraft's fetch step before building (default is False).
* `unikraft.deploy.forcePull`: Force pulling packages before building (default is False).
* `unikraft.deploy.noUpdate`: Do not update package index before running the build (default is False).
* `unikraft.deploy.buildLog`: Use the specified file to save the output from the build.
* `unikraft.deploy.envs`: The list of environmental variables to pass to the kernel.
* `unikraft.deploy.memory`: The amount of memory to give to the kernel (default is 64).
* `unikraft.deploy.name`: The name of the running instance.
* `unikraft.deploy.noStart`: Do not instantly start an instance when deploying.
* `unikraft.deploy.ports`: The list of ports to open in the kernel.
* `unikraft.deploy.replicas`: The number of replicas for one image (default 0).
* `unikraft.deploy.rootfs`: The path to the rootfs to use.
* `unikraft.deploy.timeout`: The amount of seconds to use before timing out a request (default 10).
* `unikraft.deploy.runtime`: The alternative runtime to use.
* `unikraft.deploy.strategy`: What to do with artifact duplicates (default prompt).

**Initialize command configurations**
* `unikraft.initialize.library.noProvideCMain`: Do not provide provide main to the template (default is False).
* `unikraft.initialize.library.gitInit`: Init git through the creating library (default is True).
* `unikraft.initialize.library.withPatchdir`: provide patch directory to the template (default is False).

![helloworld](https://github.com/unikraft/ide-vscode/blob/prototype/media/httpreply.gif)

Besides using `settings.json`, these settings can also be edited when clicking CTRL + Comma and searching for their names.

## LSP (Language Server Protocol) Features

Currently, LSP provide following features:

  * Auto-Completion for Kraftfile attributes.
  * Hover feature for Kraftfile attributes.
  * Vadidates against null value of any attribute in Kraftfile.
  * Auto-Completion for headerfile paths when importing in C/C++ files (Displays a list of available `*.h` files in `$PWD/.unikraft`).
  * Validates if null or repeated imports are there in `C/C++` files.

### Auto-Completion

LSP provide auto-completion feature for all the attributes of `Kraftfile` and only for importing in `C/C++` files.

#### Kraftfile Auto-Completion feature

![Kraftfile auto-completion](https://github.com/unikraft/ide-vscode/blob/main/media/kraftfile-auto-completion.gif)

**By simply typing `unikraft` in a Kraftfile minimal attributes for a Kraftfile can be auto-completed**

![Kraftfile auto-completion for `unikraft` attribute](https://github.com/unikraft/ide-vscode/blob/main/media/kraftfile-unikraft-auto-completion.gif)

#### `C/C++` language Auto-Completion feature

**Importing `*.h` files in a `C/C++` file**

![C/C++ auto-completion](https://github.com/unikraft/ide-vscode/blob/main/media/c-auto-completion.gif)

*Currenly, Only the `*.h` files present inside `$PWD/.unikraft` dir are being displayed for auto-completion in any `C/C++` file inside the workspace.*

### Hover

LSP provide Hover feature only for all the attributes of `Kraftfile`.

#### Kraftfile Hover feature

![Hovering Kraftfile](https://github.com/unikraft/ide-vscode/blob/main/media/kraftfile-hovering.gif)

### Validation

LSP provide validation feature against null value of any attribute in `Kraftfile`.

## Known Issues

* The `External libraries` view is not automatically updated when the following are changed manually:
  - `kraft.yaml`.
  - the project hierarchy.
* The output of a shell command is not logged until the command exits.
* Intellisense does not work yet in C for code portions from guarded definitions.
* Intellisense does not work in Python unless at least one build is performed. Moreover, for packages installed after the build, it does not work at all.
* At the moment, Intellisense works by parsing the directory structure and not by parsing `kraft.yaml` and the configuration files.

## Release Notes

### 1.0.0

Initial release of the extension.
