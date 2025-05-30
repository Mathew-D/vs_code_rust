const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // ✅ Import exec
const https = require('https');

function activate(context) {
    // Create Status Bar item
   // const rustStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 250);
   // r/ustStatusBarItem.text = "Rust: Menu"; // Label on the Status Bar
   // /r/ustStatusBarItem.command = "extension.showRustMenu"; // Command triggered when clicked
  //  rustS/tatusBarItem.show(); // Display the button in the Status Bar
   

    // Add it to context so it's disposed properly
    //  context.subscriptions.push(rustStatusBarItem);

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
            { label: 'Add Rust General Help File From The Web', command: 'extension.disposableReadMeHelp' },
            { label: 'Add Rust Advanced Help File From The Web', command: 'extension.disposableAdvancedHelp' },
            { label: 'Add Web Support', command: 'extension.addWebSupport' },
            { label: 'Build: Linux Output', command: 'extension.disposableNativeOut' },
            { label: 'Build: Windows Output', command: 'extension.disposableWindowOut' },
            { label: 'Build: Web Output', command: 'extension.disposableWebOut' },
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

        let terminal = vscode.window.createTerminal("Cargo Terminal");
        terminal.show();
    
        let runCommand = (command) => {
            terminal.sendText(command);
        };

        runCommand("cargo init");

        runCommand("cargo add macroquad");
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
    vscode.window.showInformationMessage(`Adding Web Support in: ${folderPath}`);
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
    let terminal = vscode.window.createTerminal("Cargo Terminal");
    terminal.show();

    // Define the command to build the project
    const buildCommand = "cargo build --release --target wasm32-unknown-unknown";

    // Run the build command and wait for it to complete
    terminal.sendText(buildCommand);
    await waitForBuildOutput(folderPath, "wasm32-unknown-unknown", ".wasm");
        //vscode.window.showInformationMessage('Build Completed!');

        // Now that the build is complete, move the files
        const pkgFolder = path.join(folderPath, "pkg");
        const binaryName = path.basename(folderPath) + ".wasm";
        const releaseBinary = path.join(folderPath, "target", "wasm32-unknown-unknown", "release", binaryName);

        moveBuildOutput(pkgFolder, releaseBinary, binaryName, folderPath);
        vscode.window.showInformationMessage(`Web Output Built.`);
       // vscode.window.showInformationMessage(`Windows Output Built and Moved.`);
  
});

let disposableNativeOut = vscode.commands.registerCommand('extension.disposableNativeOut', async () => {

    const folderPath = await getFolderPath();

    if (!folderPath) {
        vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
        return;
    }
    let terminal = vscode.window.createTerminal("Cargo Terminal");
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
    let terminal = vscode.window.createTerminal("Cargo Terminal");
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
    let terminal = vscode.window.createTerminal("Cargo Terminal");
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
    let terminal = vscode.window.createTerminal("Cargo Terminal");
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
    disposableWebRun,
    disposableCargoRun,
    disposableNativeOut,
    disposableWindowOut,
    disposableImgButton,
    disposableaddImage,
    disposableaddCollsion,
    disposableImagePreload,
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

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
