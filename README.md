# VS Code Rust Helper Extension

## Overview
The **VS Code Rust Helper** is a Visual Studio Code extension that provides various Rust-related commands to streamline development. It allows users to create new Rust projects, build for different targets, and download additional support files.

## Features
- **Create a Rust Project**: Easily initialize a new Rust project.
- **Build for WebAssembly (wasm32)**: Compile Rust projects for WebAssembly.
- **Build for Linux (x86_64-unknown-linux-gnu)**: Compile Rust projects for Linux.
- **Download Rust Objects**: Automatically install missing Rust objects to use.
- **Check Web Dependencies**: Verify and install required tools for web builds.

## Building Programs

### Prerequisites for Web Builds
Before building for web, ensure you have the required tools:

1. **Install the WebAssembly target:**
```bash
rustup target add wasm32-unknown-unknown
```

2. **Install wasm-bindgen-cli:**
```bash
cargo install wasm-bindgen-cli
```

You can use the "Check Web Dependencies" command in the extension to automatically install these.

### Windows Builds
To build Windows applications, you need to add Windows support first:
```bash
sudo pacman -S mingw-w64-gcc
rustup target add x86_64-pc-windows-gnu
```

### Web Output
For Web output you must add web support to the computer before you can build it with:
```bash
rustup target add wasm32-unknown-unknown
```
NOTE: This is different than adding web-support to the program. This needs to be done once on the PC where the command in the VS code extension must be done for each program.

## Troubleshooting

### "failed to find intrinsics to enable `clone_ref` function" Error
This error typically occurs when:
1. `wasm-bindgen-cli` is not installed or is an incompatible version
2. The WebAssembly target is not properly configured
3. Missing web-specific dependencies in Cargo.toml

**Solutions:**
1. Use the "Check Web Dependencies" command to install required tools
2. Ensure your project has web support added via "Add Web Support" command
3. Try updating wasm-bindgen: `cargo install wasm-bindgen-cli --force`
4. Make sure you're using compatible versions of macroquad and wasm-bindgen

### Other Common Issues
- **Build timeouts**: Increase your network timeout if downloading dependencies fails
- **Permission issues**: Ensure you have write permissions in your project directory
- **Missing dependencies**: The extension automatically adds required dependencies to new projects

## Installation
1. Download vsix file from:
```
    https://github.com/Mathew-D/vs_code_rust
```

## Contribution
Feel free to fork the repository, open issues, and submit pull requests to improve the extension.

## License
This project is licensed under the MIT License.

