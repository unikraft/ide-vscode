# kraft

The kraft extension facilitates the development of Unikraft applications and libraries (both external and internal).

## Installation

Enter the extension directory and run the following commands:
```
sudo vsce package
code --install-extension kraft-0.0.1.vsix
```

## Features

### Project initialization

The command `Kraft: Initialize project` from the command palette allows creating a new project in the opened directory. It can create the following project types:

#### Application

An application can either be created from an existing template or it can be a blank one.

The Unikraft hierarchy will be in `./.unikraft`, whereas the application source code will be in the opened directory.

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

The command `Kraft: Configure project` from the command palette allows configuring the project from the `kraft.yaml` file or interactively by opening a terminal with `menuconfig`.

### Project building

The command `Kraft: Build project` from the command palette builds the unikernel based on the configuration file.

### Project running

The command `Kraft: Run project` from the command palette runs the built unikernel in a new terminal.

### External dependencies inspection

The `External libraries` view allows inspecting various types of external libraries:
* the ones that are specified in `kraft.yaml` and are also present in the project hierarchy (U icon);
* the ones that are only specified in `kraft.yaml` (red icon);
* the ones that are only present in the project hierarchy (green icon).

A new library can be added to the project from this view by clicking the `+` button and selecting the library and its version from a drop-down list.

A library can either be removed from the project (it will still be stored on disk) or purged by clicking right on it.

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

* `myExtension.githubToken`: contains the Github Token used by kraft
* `myExtension.ukWorkdir`: contains the UK_WORKDIR; its value is overridden by `Kraft initialize`

Besides using `settings.json`, these settings can also be edited when clicking CTRL + Comma and searching for their names.

## Known Issues

* The `External libraries` view is not automatically updated when the following are changed manually:
  - `ukWorkdir`;
  - `kraft.yaml`;
  - the project hierarchy.
* The output of a shell command is not logged until the command exits.
* `Kraft initialize` sets `UK_WORKDIR` to a directory from the project structure, it currently does not support initializing a project with a different `UK_WORKDIR`.

## Release Notes - TODO

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of the extension.
