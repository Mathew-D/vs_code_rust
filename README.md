# VS Code Rust Helper Extension

## Overview
The **VS Code Rust Helper** is a Visual Studio Code extension that provides various Rust-related commands to streamline development. It allows users to create new Rust projects, build for different targets, and download additional support files.

## Features
- **Create a Rust Project**: Easily initialize a new Rust project.
- **Build for WebAssembly (wasm32)**: Compile Rust projects for WebAssembly.
- **Build for Linux (x86_64-unknown-linux-gnu)**: Compile Rust projects for Linux.
- **Download Rust Objects**: Automatically install missing Rust objects to use.

## Building progroms
- to build windows applications but you will need to add the supprt first with:
```
    sudo pacman -S mingw-w64-gcc
    rustup target add x86_64-pc-windows-gnu
```
- For Web output you must add web support to the computer before you can build it with:
```
    rustup target add wasm32-unknown-unknown
```
NOTE: This is different then adding web-support to the program. This needs to be done once on the PC where the command in the VS code extension must be done for each program.

## Installation
1. Download vsix file from:
```
    https://github.com/Mathew-D/vs_code_rust
```

## Contribution
Feel free to fork the repository, open issues, and submit pull requests to improve the extension.

## License
This project is licensed under the MIT License.

