# Unikraft VSCode Extension

The Unikraft VSCode Extension extension facilitates the development of Unikraft applications and libraries (both external and internal).

## Installation

Enter the extension directory and run the following commands:
```
sudo vsce package
code --install-extension unikraft-0.0.1.vsix
```

## Features

### Project initialization

The command `Unikraft: Initialize project` from the command palette allows creating a new project in the opened directory. It can create the following project types:

#### Application

An application can either be created from an existing template or it can be a blank one.

An application can have 2 layouts:
- the Unikraft hierarchy will be in `./.unikraft`, whereas the application source code will be in the opened directory;
- the application source code will be in the opened directory, but the Unikraft hierarchy will be in `~/.unikraft`.

#### Library

The user has to provide the extension with the following information in order to initialize a library:
* library name
* origin
* version
* author name
* author email.

The Unikraft hierarchy will be in `./.unikraft`, the library source code will be in `./unikraft/libs/$lib_name`, whereas the application for testing the library will be in the opened directory.

#### Core

The opened directory will be populated with the Unikraft hierarchy:
* archs
* apps
* libs
* plats
* unikraft.

### Project configuration

The command `Unikraft: Configure project` from the command palette allows configuring the project from the `kraft.yaml` file or interactively by opening a terminal with `menuconfig`.

### Project building

The command `Unikraft: Build project` from the command palette builds the unikernel based on the configuration file.

### Project running

The command `Unikraft: Run project` from the command palette runs the built unikernel in a new terminal.

If there are multiple images, the user has to choose one of them.

### External dependencies inspection

The `External libraries` view allows inspecting various types of external libraries:
* the ones that are specified in `kraft.yaml` and are also present in the project hierarchy (U icon);
* the ones that are only specified in `kraft.yaml` (red icon);
* the ones that are only present in the project hierarchy (green icon).

A new library can be added to the project from this view by clicking the `+` button and selecting the library and its version from a drop-down list.

A library can either be removed from the project (it will still be stored on disk) or purged by clicking right on it.

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

The following packages are required for `kraft`:
```
sudo apt-get install -y --no-install-recommends build-essential \
	libncurses-dev libyaml-dev flex git wget bison \
	unzip uuid-runtime
```

The package `kraft` is also required:
```
pip install git+https://github.com/unikraft/kraft.git
```

These are automatically installed if the `.kraftrc` file is not present in the user's home.

## Extension Settings

This extension contributes the following settings:

* `unikraft.githubToken`: contains the Github Token used by kraft
* `unikraft.ukWorkdir`: contains the UK_WORKDIR; its value is overridden by `Unikraft initialize`

* `unikraft.paused`: whether to start the unikernel in paused state (default is False)
* `unikraft.debug`: whether to start the unikernel in debug mode (default is False)
* `unikraft.gdb`: whether to attach gdb (default is False)
* `unikraft.gdb_port`: port for gdb (default is 4123)
* `unikraft.bridged`: whether to use a bridge or not (default is False)
* `unikraft.bridge_name`: bridge name (default is virbr0)
* `unikraft.ip4`: IP of the unikernel (default is 172.44.0.2)
* `unikraft.gateway_ip4`: IP of the gateway (default is 172.44.0)
* `unikraft.netmask4`: network mask (default is 255.255.255.0)

Besides using `settings.json`, these settings can also be edited when clicking CTRL + Comma and searching for their names.

## Known Issues

* The `External libraries` view is not automatically updated when the following are changed manually:
  - `ukWorkdir`;
  - `kraft.yaml`;
  - the project hierarchy.
* The output of a shell command is not logged until the command exits.
* `Unikraft: Initialize project` sets `UK_WORKDIR` to a directory either from the project structure, or from the home of the user; it currently does not support initializing a project with a different `UK_WORKDIR`.
* Intellisense does not work yet in C for code portions from guarded definitions.
* Intellisense does not work in Python unless at least one build is performed. Moreover, for packages installed after the build, it does not work at all.
* At the moment, Intellisense works by parsing the directory structure and not by parsing `kraft.yaml` and the configuration files.

## Release Notes

### 1.0.0

Initial release of the extension.
