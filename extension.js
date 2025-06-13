const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // ✅ Import exec
const https = require('https');

// Add a global terminal variable
let cargoTerminal = null;

function activate(context) {
    // Create Status Bar item
    // const rustStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 250);
    // r/ustStatusBarItem.text = "Rust: Menu"; // Label on the Status Bar
    // /r/ustStatusBarItem.command = "extension.showRustMenu"; // Command triggered when clicked
    //  rustS/tatusBarItem.show(); // Display the button in the Status Bar


    // Add it to context so it's disposed properly
    // Register a handler to reset terminal reference when it's closed
    context.subscriptions.push(
        vscode.window.onDidCloseTerminal(terminal => {
            if (terminal === cargoTerminal) {
                cargoTerminal = null;
            }
        })
    );

    // Register the "Show Rust Menu" command
    let disposableShowMenu = vscode.commands.registerCommand('extension.showRustMenu', async () => {
        const options = [
            { label: 'Create Rust Project', command: 'extension.createRustProject' },
            { label: 'Run Program', command: 'extension.disposableCargoRun' },
            { label: 'Add Grid Module From The Web', command: 'extension.disposableGrid' },
            { label: 'Add Label Module From The Web', command: 'extension.disposableLabelCreate' },
            { label: 'Add Still Image Module From The Web', command: 'extension.disposableaddImage' },
            { label: 'Add Animated Image Module From The Web', command: 'extension.disposableAnimatedImg' },
            { label: 'Add Preload Image Module From The Web', command: 'extension.disposableImagePreload' },
            { label: 'Add Text Button Module From The Web', command: 'extension.disposableButtons' },
            { label: 'Add Image Button Module From The Web', command: 'extension.disposableImgButton' },
            { label: 'Add Text Input Module From The Web', command: 'extension.disposableTextInput' },
            { label: 'Add ListView Module From The Web', command: 'extension.disposableListviewCreate' },
            { label: 'Add Text Files Module From The Web', command: 'extension.disposableTextFiles' },
            { label: 'Add Slider Module From The Web', command: 'extension.disposableSliderCreate' },
            { label: 'Add Progress Bar Module From The Web', command: 'extension.disposableProgressBar' },
            { label: 'Add Message Box Module From The Web', command: 'extension.disposableMessageBoxCreate' },
            { label: 'Add Collision Module From The Web', command: 'extension.disposableaddCollsion' },
            { label: 'Add Scale Module From The Web', command: 'extension.disposableScale' },
            { label: 'Add Database Module From The Web', command: 'extension.disposableDatabase' },
            { label: 'Add Rust General Help File From The Web', command: 'extension.disposableReadMeHelp' },
            { label: 'Add Rust Advanced Help File From The Web', command: 'extension.disposableAdvancedHelp' },
            { label: 'Build: Linux Output', command: 'extension.disposableNativeOut' },
            { label: 'Build: Windows Output', command: 'extension.disposableWindowOut' },
            { label: 'Build: Web Output (Basic)', command: 'extension.disposableWebOutBasic' },
            { label: 'Build: Web Output (Advanced)', command: 'extension.disposableWebOut' },
            { label: 'Test: Run Web Server', command: 'extension.disposableWebRun' },
        ];
        const selected = await vscode.window.showQuickPick(options, { placeHolder: 'Choose an option' });
        if (selected) {
            vscode.commands.executeCommand(selected.command);
        }
        //     context.subscriptions.push(disposableShowMenu);
    });
    // Register the "Create Rust Project" command
    let disposableCreateRust = vscode.commands.registerCommand('extension.createRustProject', async () => {
        // Get the folder path from the active workspace or open file
        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        let runCommand = (command) => {
            terminal.sendText(command);
        };

        runCommand("cargo init");

        runCommand("cargo add macroquad");

        // Add a cross-platform approach to add features section to Cargo.toml
        // Set up a polling interval to check when Cargo.toml is ready
        let checkInterval;
        const maxWaitTime = 90000; // Maximum wait time in milliseconds (1.5 minutes)
        const startTime = Date.now();

        const checkAndUpdateCargoToml = () => {
            try {
                const cargoTomlPath = path.join(folderPath, 'Cargo.toml');

                if (fs.existsSync(cargoTomlPath)) {
                    // Check if the file has the macroquad dependency
                    let content = fs.readFileSync(cargoTomlPath, 'utf8');

                    if (content.includes("macroquad") && !content.includes("[features]")) {
                        // Cargo.toml exists and has macroquad dependency but no features section yet
                        // Append the features section and wasm32-specific dependencies
                        //const additionalContent = '\n[features]\nscale = []\ndefault = []\n\n[target.\'cfg(target_arch = "wasm32")\'.dependencies]\nwasm-bindgen = "0.2"\n';
                        const additionalContent = '\n[features]\nscale = []\ndefault = []\n';
                        fs.appendFileSync(cargoTomlPath, additionalContent);
                        // console.log('Added features section to Cargo.toml');

                        // Stop checking
                        clearInterval(checkInterval);
                    } else if (Date.now() - startTime > maxWaitTime) {
                        // Time exceeded, stop checking
                        clearInterval(checkInterval);
                        console.warn('Timed out waiting for Cargo.toml to be updated with macroquad');
                    }
                } else if (Date.now() - startTime > maxWaitTime) {
                    // Time exceeded, stop checking
                    clearInterval(checkInterval);
                    console.warn('Timed out waiting for Cargo.toml to be created');
                }
            } catch (error) {
                console.error('Error checking/updating Cargo.toml:', error);
                clearInterval(checkInterval);
            }
        };

        // Check every second until the file is ready or timeout occurs
        checkInterval = setInterval(checkAndUpdateCargoToml, 1000);

        const fmtPath = path.join(folderPath, 'rustfmt.toml');
        fs.writeFileSync(fmtPath, "max_width = 150\n");

        //   vscode.window.showInformationMessage(`Project initialized in ${folderPath}!`);
        const srcFolder = path.join(folderPath, 'src');
        if (!fs.existsSync(srcFolder)) {
            fs.mkdirSync(srcFolder, { recursive: true });
        }
        const assetsFolder = path.join(folderPath, 'assets');
        if (!fs.existsSync(assetsFolder)) {
            fs.mkdirSync(assetsFolder, { recursive: true });
        }
        const lastFolderName = path.basename(folderPath);
        const mainRsPath = path.join(folderPath, 'src', 'main.rs');
        const mainRsContent = `/*
By: <Your Name Here>
Date: ${date}
Program Details: <Program Description Here>
*/

mod modules;

use macroquad::prelude::*;

/// Set up window settings before the app runs
fn window_conf() -> Conf {
    Conf {
        window_title: "${lastFolderName}".to_string(),
        window_width: 1024,
        window_height: 768,
        fullscreen: false,
        high_dpi: true,
        window_resizable: true,
        sample_count: 4, // MSAA: makes shapes look smoother
        ..Default::default()
    }
}

#[macroquad::main(window_conf)]
async fn main() {
    
    loop {
        clear_background(RED);

        draw_line(40.0, 40.0, 100.0, 200.0, 15.0, BLUE);
        draw_rectangle(screen_width() / 2.0 - 60.0, 100.0, 120.0, 60.0, GREEN);

        next_frame().await;
    }
}
`;
        fs.writeFileSync(mainRsPath, mainRsContent);
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/mod.rs';

        const modulesFolderPath = await downloadToFolder('modules', 'mod.rs', url);
        vscode.window.showInformationMessage(`Creating Rust Project in: ${folderPath}`);
        // You can add your logic to run cargo init here
    });

    // Register the "Add Web Support" command
    let disposableAddWebSupport = vscode.commands.registerCommand('extension.addWebSupport', async () => {
        // Get the folder path from the active workspace or open file
        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        const lastFolderName = path.basename(folderPath);

        const indexHtmlContent = `
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${lastFolderName}</title>
            <style>
                 /* === MODE 1: Responsive fullscreen canvas (default) === */
        html,body,canvas {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: black;
        }

        /* === MODE 2: Fixed-size centered canvas (uncomment to use) === */
        /*
        body {
            margin: 0;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        canvas {
            width: 1024px;
            height: 768px;
            background: black;
        }

        html {
            overflow: hidden;
        }
        */
            </style>
        </head>
        <body>
            <canvas id="glcanvas" tabindex='1'></canvas>
            <script src="https://not-fl3.github.io/miniquad-samples/mq_js_bundle.js"></script>
            <script>load("pkg/${lastFolderName}.wasm");</script>
        </body>
        </html>
        `;

        fs.writeFileSync(path.join(folderPath, 'index.html'), indexHtmlContent);
       // vscode.window.showInformationMessage(`Adding Web Support in: ${folderPath}`);
    });


    let disposableButtons = vscode.commands.registerCommand('extension.disposableButtons', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/text_button.rs';

        const folderPath = await downloadToFolder('modules', 'text_button.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Button Module in: ${folderPath}`);
        }
    });

    let disposableGrid = vscode.commands.registerCommand('extension.disposableGrid', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/grid.rs';

        const folderPath = await downloadToFolder('modules', 'grid.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Grid Module in: ${folderPath}`);
        }
    });


    let disposableWebOut = vscode.commands.registerCommand('extension.disposableWebOut', async () => {

        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }

        // Check if index.html exists, if not, automatically add web support
        const indexHtmlPath = path.join(folderPath, 'index.html');
        if (!fs.existsSync(indexHtmlPath)) {
          //  vscode.window.showInformationMessage('Web support not found. Adding web support automatically...');
            
            // Automatically create the HTML file (same logic as addWebSupport)
            const lastFolderName = path.basename(folderPath);
            const indexHtmlContent = `
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${lastFolderName}</title>
            <style>
                 /* === MODE 1: Responsive fullscreen canvas (default) === */
        html,body,canvas {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: black;
        }

        /* === MODE 2: Fixed-size centered canvas (uncomment to use) === */
        /*
        body {
            margin: 0;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        canvas {
            width: 1024px;
            height: 768px;
            background: black;
        }

        html {
            overflow: hidden;
        }
        */
            </style>
        </head>
        <body>
            <canvas id="glcanvas" tabindex='1' hidden></canvas>
            <script src="https://not-fl3.github.io/miniquad-samples/mq_js_bundle.js"></script>
            <script type="module">
        import init, { set_wasm } from "./pkg/${lastFolderName}.js";
        async function impl_run() {
            let wbg = await init();
            miniquad_add_plugin({
                register_plugin: (a) => (a.wbg = wbg),
                on_init: () => set_wasm(wasm_exports),
                version: "0.0.1",
                name: "wbg",
            });
            load("./pkg/${lastFolderName}_bg.wasm");
        }
          // Auto-run when page loads
        window.addEventListener('load', function() {
            document.getElementById("glcanvas").removeAttribute("hidden");
            document.getElementById("glcanvas").focus();
            impl_run();
        });
    </script>
        </body>
        </html>
        `;

            fs.writeFileSync(indexHtmlPath, indexHtmlContent);
        //    vscode.window.showInformationMessage(`Web support added automatically to: ${folderPath}`);
        }

        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        // Define the command to build the project
        const buildCommand = "cargo build --release --target wasm32-unknown-unknown";

        // Run the build command and wait for it to complete
        terminal.sendText(buildCommand);
        
        try {
            await waitForBuildOutput(folderPath, "wasm32-unknown-unknown", ".wasm");
        } catch (error) {
            vscode.window.showErrorMessage(`Build failed: ${error.message}`);
            return;
        }

        const lastFolderName = path.basename(folderPath);
        // Now that the build is complete, move the files
        const pkgFolder = path.join(folderPath, "pkg");
        const binaryName = path.basename(folderPath) + ".wasm";
        const releaseBinary = path.join(folderPath, "target", "wasm32-unknown-unknown", "release", binaryName);

        moveBuildOutput(pkgFolder, releaseBinary, binaryName, folderPath);
        
        const wasmBindgenCommand = `wasm-bindgen "${path.join(folderPath, 'target', 'wasm32-unknown-unknown', 'release', lastFolderName + '.wasm')}" --out-dir pkg --target web --no-typescript --weak-refs`;
        terminal.sendText(wasmBindgenCommand);
        
        // Wait for wasm-bindgen to complete by checking for the generated files
        try {
            console.log('Waiting for wasm-bindgen to generate files...');
            await waitForWasmBindgenOutput(folderPath, lastFolderName);
        } catch (error) {
            vscode.window.showErrorMessage(`wasm-bindgen failed: ${error.message}`);
            return;
        }
        
        // Apply the patch to fix web compatibility issues
        console.log('Applying patch to JavaScript file...');
        const patchSuccess = patchFile(lastFolderName, folderPath);
        
        if (patchSuccess) {
            vscode.window.showInformationMessage(`Web build completed successfully! Files are ready in the pkg folder.`);
            terminal.sendText('echo "📁 Output files available in the pkg folder"');
        } else {
            vscode.window.showWarningMessage(`Web build completed but patching failed. Check the JavaScript file manually.`);
        }

    });

    let disposableWebOutBasic = vscode.commands.registerCommand('extension.disposableWebOutBasic', async () => {

        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }

        // Use addWebSupport to create basic HTML file
        const lastFolderName = path.basename(folderPath);
        const indexHtmlContent = `
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${lastFolderName}</title>
            <style>
                 /* === MODE 1: Responsive fullscreen canvas (default) === */
        html,body,canvas {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: black;
        }

        /* === MODE 2: Fixed-size centered canvas (uncomment to use) === */
        /*
        body {
            margin: 0;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        canvas {
            width: 1024px;
            height: 768px;
            background: black;
        }

        html {
            overflow: hidden;
        }
        */
            </style>
        </head>
        <body>
            <canvas id="glcanvas" tabindex='1'></canvas>
            <script src="https://not-fl3.github.io/miniquad-samples/mq_js_bundle.js"></script>
            <script>load("pkg/${lastFolderName}.wasm");</script>
        </body>
        </html>
        `;

        fs.writeFileSync(path.join(folderPath, 'index.html'), indexHtmlContent);

        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        // Define the command to build the project
        const buildCommand = "cargo build --release --target wasm32-unknown-unknown";

        // Run the build command and wait for it to complete
        terminal.sendText(buildCommand);
        
        try {
            await waitForBuildOutput(folderPath, "wasm32-unknown-unknown", ".wasm");
        } catch (error) {
            vscode.window.showErrorMessage(`Build failed: ${error.message}`);
            return;
        }

        // Now that the build is complete, move the files
        const pkgFolder = path.join(folderPath, "pkg");
        const binaryName = path.basename(folderPath) + ".wasm";
        const releaseBinary = path.join(folderPath, "target", "wasm32-unknown-unknown", "release", binaryName);

        moveBuildOutput(pkgFolder, releaseBinary, binaryName, folderPath);
        
        vscode.window.showInformationMessage(`Basic web build completed! Files are ready in the pkg folder.`);
        terminal.sendText('echo "📁 Basic web output files available in the pkg folder"');

    });

    let disposableNativeOut = vscode.commands.registerCommand('extension.disposableNativeOut', async () => {

        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        // Define the command to build the project
        const buildCommand = "cargo build --release --target x86_64-unknown-linux-gnu";

        // Run the build command and wait for it to complete
        terminal.sendText(buildCommand);
        await waitForBuildOutput(folderPath, "x86_64-unknown-linux-gnu", "");

        //vscode.window.showInformationMessage('Build Completed!');

        // Now that the build is complete, move the files
        const pkgFolder = path.join(folderPath, "pkg");
        const binaryName = path.basename(folderPath);
        const releaseBinary = path.join(folderPath, "target", "x86_64-unknown-linux-gnu", "release", binaryName);

        moveBuildOutput(pkgFolder, releaseBinary, binaryName, folderPath);
        vscode.window.showInformationMessage(`Linux Output Built.`);
        // vscode.window.showInformationMessage(`Windows Output Built and Moved.`);




    });
    let disposableWindowOut = vscode.commands.registerCommand('extension.disposableWindowOut', async () => {

        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        // Define the command to build the project
        const buildCommand = "cargo build --release --target x86_64-pc-windows-gnu";

        // Run the build command and wait for it to complete

        terminal.sendText(buildCommand);

        await waitForBuildOutput(folderPath, "x86_64-pc-windows-gnu", ".exe");


        //   vscode.window.showInformationMessage('Build Completed!');

        // Now that the build is complete, move the files
        const pkgFolder = path.join(folderPath, "pkg");
        const binaryName = path.basename(folderPath) + ".exe";
        const releaseBinary = path.join(folderPath, "target", "x86_64-pc-windows-gnu", "release", binaryName);

        moveBuildOutput(pkgFolder, releaseBinary, binaryName, folderPath);
        vscode.window.showInformationMessage(`Windows Output Built.`);
        // vscode.window.showInformationMessage(`Windows Output Built and Moved.`);

    });



    let disposableCargoRun = vscode.commands.registerCommand('extension.disposableCargoRun', async () => {

        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        let runCommand = (command) => {
            terminal.sendText(command);
        };

        runCommand("cargo run");

        vscode.window.showInformationMessage(`Native Built.`);
    });
    let disposableWebRun = vscode.commands.registerCommand('extension.disposableWebRun', async () => {

        const folderPath = await getFolderPath();

        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.show();

        let runCommand = (command) => {
            terminal.sendText(command);
        };

        runCommand("python3 -m http.server 8080 --bind 127.0.0.1");

        vscode.window.showInformationMessage(`Server Running.`);
    });
    let disposableImgButton = vscode.commands.registerCommand('extension.disposableImgButton', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/image_button.rs';

        const folderPath = await downloadToFolder('modules', 'image_button.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Image Button Module in: ${folderPath}`);
        }
    });
    let disposableReadMeHelp = vscode.commands.registerCommand('extension.disposableReadMeHelp', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/RUST_HELP.md';

        const folderPath = await getFolderPath();
        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        const filePath = path.join(folderPath, 'RUST_HELP.md');
        downloadFile(url, filePath);
        vscode.window.showInformationMessage(`Adding Rust Help File in: ${folderPath}`);
    });
    let disposableAdvancedHelp = vscode.commands.registerCommand('extension.disposableAdvancedHelp', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/RUST_ADVANCED.md';

        const folderPath = await getFolderPath();
        if (!folderPath) {
            vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
            return;
        }
        const filePath = path.join(folderPath, 'RUST_ADVANCED.md');
        downloadFile(url, filePath);
        vscode.window.showInformationMessage(`Adding Rust Advanced Help File in: ${folderPath}`);
    });
    let disposableTextFiles = vscode.commands.registerCommand('extension.disposableTextFiles', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/textfiles.rs';

        const folderPath = await downloadToFolder('modules', 'textfiles.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Text Files Module in: ${folderPath}`);
        }
    });
    let disposableAnimatedImg = vscode.commands.registerCommand('extension.disposableAnimatedImg', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/animated_image.rs';

        const folderPath = await downloadToFolder('modules', 'animated_image.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Animated Image Module in: ${folderPath}`);
        }
    });
    let disposableMessageBoxCreate = vscode.commands.registerCommand('extension.disposableMessageBoxCreate', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/messagebox.rs';

        const folderPath = await downloadToFolder('modules', 'messagebox.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Message Box Module in: ${folderPath}`);
        }
    });
    let disposableProgressBar = vscode.commands.registerCommand('extension.disposableProgressBar', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/progressbar.rs';

        const folderPath = await downloadToFolder('modules', 'progressbar.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Progress Bar Module in: ${folderPath}`);
        }
    });
    let disposableSliderCreate = vscode.commands.registerCommand('extension.disposableSliderCreate', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/slider.rs';

        const folderPath = await downloadToFolder('modules', 'slider.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Slider Module in: ${folderPath}`);
        }
    });
    let disposableLabelCreate = vscode.commands.registerCommand('extension.disposableLabelCreate', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/label.rs';

        const folderPath = await downloadToFolder('modules', 'label.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding label Module in: ${folderPath}`);
        }
    });
    let disposableListviewCreate = vscode.commands.registerCommand('extension.disposableListviewCreate', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/listview.rs';

        const folderPath = await downloadToFolder('modules', 'listview.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding ListView Module in: ${folderPath}`);
        }
    });
    let disposableTextInput = vscode.commands.registerCommand('extension.disposableTextInput', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/text_input.rs';

        const folderPath = await downloadToFolder('modules', 'text_input.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Text Input Module in: ${folderPath}`);
        }
    });
    let disposableaddImage = vscode.commands.registerCommand('extension.disposableaddImage', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/still_image.rs';

        const folderPath = await downloadToFolder('modules', 'still_image.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Images Module in: ${folderPath}`);
        }
    });

    let disposableaddCollsion = vscode.commands.registerCommand('extension.disposableaddCollsion', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/collision.rs';

        const folderPath = await downloadToFolder('modules', 'collision.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding collision Module in: ${folderPath}`);
        }
    });

    let disposableDatabase = vscode.commands.registerCommand('extension.disposableDatabase', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/database.rs';

        const folderPath = await downloadToFolder('modules', 'database.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Database Module in: ${folderPath}`);
        }
    });

    let disposableImagePreload = vscode.commands.registerCommand('extension.disposableImagePreload', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/preload_image.rs';

        const folderPath = await downloadToFolder('modules', 'preload_image.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Preload Image Module in: ${folderPath}`);
        }
    });

    let disposableScale = vscode.commands.registerCommand('extension.disposableScale', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/scale.rs';

        const folderPath = await downloadToFolder('modules', 'scale.rs', url);
        if (folderPath) {
            vscode.window.showInformationMessage(`Adding Scale Module in: ${folderPath}`);
        }
    });

    // Add commands to the context subscriptions
    context.subscriptions.push(
        disposableShowMenu,
        disposableCreateRust,
        disposableGrid,
        disposableAddWebSupport,
        disposableSliderCreate,
        disposableProgressBar,
        disposableLabelCreate,
        disposableAnimatedImg,
        disposableTextInput,
        disposableReadMeHelp,
        disposableAdvancedHelp,
        disposableTextFiles,
        disposableListviewCreate,
        disposableMessageBoxCreate,
        disposableButtons,
        disposableWebOut,
        disposableWebOutBasic,
        disposableWebRun,
        disposableCargoRun,
        disposableNativeOut,
        disposableWindowOut,
        disposableImgButton,
        disposableaddImage,
        disposableaddCollsion,
        disposableImagePreload,
        disposableDatabase,
        disposableScale
    );
}

// Function to get the folder path (from workspace or active file)
async function getFolderPath() {
    // Check if there's an open folder/workspace
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : undefined;

    if (workspaceFolder) {
        return workspaceFolder.uri.fsPath; // Return the folder path of the open workspace
    }

    // If no workspace, check if there's an open file and get its directory path
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.scheme === 'file') {
        return vscode.workspace.getWorkspaceFolder(activeEditor.document.uri)?.uri.fsPath;
    }

    return null; // Return null if no folder or file is open
}

function downloadFile(url, targetPath) {
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            vscode.window.showErrorMessage(`Failed to download ${path.basename(targetPath)}: ${response.statusCode}`);
            return;
        }

        const fileStream = fs.createWriteStream(targetPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            //      vscode.window.showInformationMessage(`${path.basename(targetPath)} downloaded successfully!`);
        });
    }).on('error', (err) => {
        vscode.window.showErrorMessage(`Download failed: ${err.message}`);
    });
}

async function downloadToFolder(folderName, fileName, url) {
    const folderPath = await getFolderPath();
    if (!folderPath) {
        vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
        return null;
    }

    // Ensure the folder is inside `src`
    const srcPath = path.join(folderPath, 'src', folderName);

    if (!fs.existsSync(srcPath)) {
        fs.mkdirSync(srcPath, { recursive: true });
    }

    const filePath = path.join(srcPath, fileName);
    downloadFile(url, filePath);

    // Return the folder path so it can be used in the calling function
    return folderPath;
}

function moveBuildOutput(pkgFolder, releaseBinary, binaryName, workspaceFolder) {
    // Delete the pkg folder if it exists
    if (fs.existsSync(pkgFolder)) {
        fs.rmSync(pkgFolder, { recursive: true, force: true });
    }

    // Create the pkg folder if it doesn’t exist
    if (!fs.existsSync(pkgFolder)) {
        fs.mkdirSync(pkgFolder, { recursive: true });
    }

    // Move the binary
    const destBinary = path.join(pkgFolder, binaryName);
    if (fs.existsSync(releaseBinary)) {
        fs.copyFileSync(releaseBinary, destBinary);
    }

    // Copy the assets folder
    const assetsFolder = path.join(workspaceFolder, "assets");
    const destAssets = path.join(pkgFolder, "assets");
    if (fs.existsSync(assetsFolder)) {
        fs.rmSync(destAssets, { recursive: true, force: true });
        fs.cpSync(assetsFolder, destAssets, { recursive: true });
    }
}
function waitForBuildOutput(folderPath, target, fileExtension) {
    return new Promise((resolve, reject) => {
        const releaseBinary = path.join(folderPath, "target", target, "release", path.basename(folderPath) + fileExtension);

        const checkInterval = setInterval(() => {
            if (fs.existsSync(releaseBinary)) {
                clearInterval(checkInterval); // Stop checking
                resolve(); // File found, proceed
            }
        }, 1000); // Check every second

        // Timeout after 5 minutes (adjust as necessary)
        setTimeout(() => {
            clearInterval(checkInterval); // Stop checking after timeout
            reject(new Error('Build process timed out waiting for the output file.'));
        }, 300000); // 5 minutes
    });
}

// Function to wait specifically for the JavaScript file from wasm-bindgen
function waitForJavaScriptFile(folderPath, projectName) {
    return new Promise((resolve, reject) => {
        const jsFilePath = path.join(folderPath, "pkg", `${projectName}.js`);
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max wait time

        console.log(`Waiting for JavaScript file: ${jsFilePath}`);
        
        // Send status to terminal
        let terminal = getOrCreateTerminal("Cargo Terminal");
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (fs.existsSync(jsFilePath)) {
                try {
                    const stats = fs.statSync(jsFilePath);
                    // File exists and has reasonable content size (> 1KB suggests it's complete)
                    if (stats.size > 1000) {
                        clearInterval(checkInterval);
                        console.log(`JavaScript file ready (${stats.size} bytes): ${jsFilePath}`);
                        
                        // Small delay to ensure file is fully written
                        setTimeout(() => {
                            resolve();
                        }, 500);
                        return;
                    }
                } catch (error) {
                    // File might be in process of being written, continue waiting
                    console.log(`File access error (continuing): ${error.message}`);
                }
            }
            
            // Progress indicator every 5 seconds
            if (attempts % 5 === 0 && attempts > 0) {
                terminal.sendText('echo "⏳ Still waiting for wasm-bindgen..."');
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                const errorMsg = `Timeout waiting for JavaScript file after ${maxAttempts}s: ${jsFilePath}`;
                console.error(errorMsg);
                terminal.sendText('echo "❌ Timeout waiting for JavaScript file"');
                vscode.window.showErrorMessage(`wasm-bindgen timeout: JavaScript file not generated after ${maxAttempts} seconds`);
                reject(new Error(errorMsg));
            }
        }, 1000); // Check every second
    });
}

// Function to wait for wasm-bindgen output files in pkg directory
function waitForWasmBindgenOutput(folderPath, projectName) {
    return new Promise((resolve, reject) => {
        const pkgFolder = path.join(folderPath, "pkg");
        const jsFilePath = path.join(pkgFolder, `${projectName}.js`);
        const wasmBgFilePath = path.join(pkgFolder, `${projectName}_bg.wasm`);
        
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max wait time

        console.log(`Waiting for wasm-bindgen files: ${jsFilePath} and ${wasmBgFilePath}`);
        
        // Send status to terminal
        let terminal = getOrCreateTerminal("Cargo Terminal");
     //   terminal.sendText('echo "⏳ Waiting for wasm-bindgen to generate files..."');
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            // Check if both files exist and have content
            const jsExists = fs.existsSync(jsFilePath);
            const wasmBgExists = fs.existsSync(wasmBgFilePath);
            
            if (jsExists && wasmBgExists) {
                try {
                    const jsStats = fs.statSync(jsFilePath);
                    const wasmBgStats = fs.statSync(wasmBgFilePath);
                    
                    // Both files exist and have reasonable content
                    if (jsStats.size > 1000 && wasmBgStats.size > 1000) {
                        clearInterval(checkInterval);
                        console.log(`wasm-bindgen files ready: JS(${jsStats.size}B), WASM(${wasmBgStats.size}B)`);
                        terminal.sendText('echo "✅ wasm-bindgen files ready"');
                        
                        // Small delay to ensure files are fully written
                        setTimeout(() => {
                            resolve();
                        }, 200);
                        return;
                    }
                } catch (error) {
                    // Files might be in process of being written, continue waiting
                    console.log(`File access error (continuing): ${error.message}`);
                }
            }
            
            // Progress indicator every 5 seconds
            if (attempts % 5 === 0 && attempts > 0) {
                // Progress tracking - no terminal output
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                const errorMsg = `Timeout waiting for wasm-bindgen files after ${maxAttempts}s`;
                console.error(errorMsg);
                vscode.window.showErrorMessage(`wasm-bindgen timeout: Files not generated after ${maxAttempts} seconds`);
                reject(new Error(errorMsg));
            }
        }, 1000); // Check every second
    });
}

// Helper function to get or create a terminal
function getOrCreateTerminal(name = "Cargo Terminal") {
    // If we already have a terminal, check if it still exists
    if (cargoTerminal) {
        const terminals = vscode.window.terminals;
        const exists = terminals.some(t => t === cargoTerminal);

        if (exists) {
            return cargoTerminal;
        }
    }

    // Create a new terminal if needed
    cargoTerminal = vscode.window.createTerminal(name);
    return cargoTerminal;
}

function patchFile(projectName, folderPath) {
    const filePath = path.join(folderPath, 'pkg', `${projectName}.js`);
    
    if (!fs.existsSync(filePath)) {
        const message = `JS file not found: ${filePath}`;
        console.warn(message);
        vscode.window.showWarningMessage(`${message} - patch skipped`);
        
        // Also send to terminal
        let terminal = getOrCreateTerminal("Cargo Terminal");
        terminal.sendText('echo "⚠️ JS file not found"');
        return false;
    }
    
    let code = fs.readFileSync(filePath, 'utf8');
    const message = `🔧 Patching JavaScript file: ${path.basename(filePath)}`;
   // console.log(message);
    
    // Send status to terminal
    let terminal = getOrCreateTerminal("Cargo Terminal");
   // terminal.sendText('echo "🔧 Patching JavaScript file..."');
    
    // Store original for comparison
    const originalCode = code;

    // Debug: Check if file contains known problematic patterns
    const hasImportEnv = code.includes(`import * as __wbg_star0 from 'env';`);
    const hasEnvAssignment = code.includes(`imports['env'] = __wbg_star0;`);
    const hasPlainWasm = /^let wasm;$/m.test(code);
    
    console.log(`Pre-patch analysis: importEnv=${hasImportEnv}, envAssignment=${hasEnvAssignment}, plainWasm=${hasPlainWasm}`);
   // terminal.sendText('echo "🔍 Analyzing file for patches..."');

    // 1. Remove the import line at the beginning
    code = code.replace(/^import \* as __wbg_star0 from 'env';\n/m, '');
    
    // 2. Replace "let wasm;" with the export version (only the first one)
    code = code.replace(/^let wasm;$/m, 'let wasm; export const set_wasm = (w) => wasm = w;');
    
    // 3. Remove the imports['env'] = __wbg_star0; line  
    code = code.replace(/\s*imports\['env'\] = __wbg_star0;\n/g, '');
    
    // 4. Replace the return imports; line with the correct return pattern
    code = code.replace(/\n\s*return imports;\n}/g, '\n    return imports.wbg;\n\n    return imports;\n}');
    
    // 5. Fix the const imports = __wbg_get_imports(); lines to return
    code = code.replace(/const imports = __wbg_get_imports\(\);/g, 'return __wbg_get_imports();');

    // Check if any changes were made
    if (code === originalCode) {
        const noChangeMessage = `⚠️  No changes applied to ${path.basename(filePath)} - may already be patched`;
        console.warn(noChangeMessage);
        vscode.window.showWarningMessage(`No patches applied - JS file may already be fixed or have unexpected format`);
        terminal.sendText('echo "⚠️ No changes applied - may already be patched"');
        return false;
    } else {
        // Verify the patches were applied correctly
        const afterImportEnv = code.includes(`import * as __wbg_star0 from 'env';`);
        const afterEnvAssignment = code.includes(`imports['env'] = __wbg_star0;`);
        const afterHasExport = code.includes(`export const set_wasm = (w) => wasm = w;`);
        
        console.log(`Post-patch analysis: importEnv=${afterImportEnv}, envAssignment=${afterEnvAssignment}, hasExport=${afterHasExport}`);
      //  terminal.sendText('echo "🔍 Patch verification completed"');
        
        fs.writeFileSync(filePath, code, 'utf8');
        const successMessage = `✅ Successfully patched ${path.basename(filePath)} for web compatibility`;
        console.log(successMessage);
        vscode.window.showInformationMessage(`Successfully patched JS bindings for web compatibility`);
      //  terminal.sendText('echo "✅ Successfully patched JavaScript file"');
        return true;
    }
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
