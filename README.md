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
* library name
* origin
* version
* author name
* author email.

The Unikraft hierarchy will be in `./.unikraft`, the library source code will be in `./unikraft/libs/$lib_name`, whereas the application for testing the library will be in the opened directory.

### Project configuration

The command `Unikraft: Configure project` from the command palette allows configuring the project interactively by opening a terminal with `menu`.

### Project building

The command `Unikraft: Build project` from the command palette builds the unikernel based on the configuration file.

### Project running

The command `Unikraft: Run project` from the command palette runs the built unikernel in a new terminal.

If there are multiple images, the user has to choose one of them.

### External dependencies inspection

The `External libraries` view allows inspecting various types of external libraries:
* the ones that are specified in `kraft.yaml` and are also present in the project hierarchy (represented with U icon);
* the ones that are only specified in `kraft.yaml` (represented with red icon);
* the ones that are only present in the project hierarchy (represented with green icon).

![libs](https://github.com/unikraft/ide-vscode/blob/prototype/media/libs.gif)

A new library and core can be added to the project from this view by clicking the `+` button and selecting the library and its version from a drop-down list.

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
  libncurses-dev \
  libyaml-dev \
  flex \
  wget \
  socat \
  bison \
  unzip \
  uuid-runtime \
  python3 \
  python3-setuptools \
  python3-pip \
  qemu-kvm \
  qemu-system-x86 \
  qemu-system-arm \
  sgabios \
  curl
```

The CLI `kraft` is also required:
```
curl --proto '=https' --tlsv1.2 -sSf https://get.kraftkit.sh | sh
```

These are automatically installed if `Kraftkit` is not installed on this system.

## Extension Settings

This extension contributes the following settings:

* `unikraft.sources`: Sets the environment variable `KRAFTKIT_PATHS_SOURCES` by default set by `~/.config/kraftkit/config.yaml` or ENV `KRAFTKIT_PATHS_SOURCES` that is further used by extension for `kraft` commands.
* `unikraft.manifests`: Sets the environment variable `KRAFTKIT_PATHS_MANIFESTS` by default set by `~/.config/kraftkit/config.yaml` or ENV `KRAFTKIT_PATHS_MANIFESTS` that is further used by extension for `kraft` commands.
* `unikraft.detach`: Whether to run unikernel in background (default is False).
* `unikraft.disableAccel`: Whether to disable acceleration of CPU (usually enables TCG) when running `kraft run` (default is False).
* `unikraft.symbolic`: Whether to use the debuggable (symbolic) unikernel when running `kraft run` (default is False).
* `unikraft.remove`: Whether to automatically remove the unikernel when it shutsdown (default is False).
* `unikraft.ip`: Assign the provided IP address when running `kraft run`.
* `unikraft.memory`: Assign MB memory to the unikernel (default is 64M) when running.
* `unikraft.network`: Attach instance to the provided network in the format `<driver>:<network>` when running `kraft run`.
* `unikraft.ports`: Publish a machine's port(s) to the host (An array of strings e.g ["8080"]) when running `kraft run`.

![helloworld](https://github.com/unikraft/ide-vscode/blob/prototype/media/httpreply.gif)

Besides using `settings.json`, these settings can also be edited when clicking CTRL + Comma and searching for their names.

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
