const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // ✅ Import exec
const https = require('https');

function activate(context) {
    // Create Status Bar item
    const rustStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 250);
    rustStatusBarItem.text = "Rust: Menu"; // Label on the Status Bar
    rustStatusBarItem.command = "extension.showRustMenu"; // Command triggered when clicked
    rustStatusBarItem.show(); // Display the button in the Status Bar
   
    // Add it to context so it's disposed properly
  //  context.subscriptions.push(rustStatusBarItem);

    // Register the "Show Rust Menu" command
    let disposableShowMenu = vscode.commands.registerCommand('extension.showRustMenu', async () => {
        const options = [
            { label: 'Create Rust Project', command: 'extension.createRustProject' },
            { label: 'Add Button Object From The Web', command: 'extension.addButtonSupport' },
            { label: 'Add Text Input Object From The Web', command: 'extension.addTextInputSupport' },
            { label: 'Add Web Support', command: 'extension.addWebSupport' },
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

        // ✅ Run `cargo init` first
        exec('cargo init', { cwd: folderPath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error initializing Cargo: ${stderr}`);
                return;
            }
        });


        // ✅ Run `cargo add macroquad` next
        exec('cargo add macroquad', { cwd: folderPath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error adding macroquad: ${stderr}`);
                return;
            }
        });
     //   vscode.window.showInformationMessage(`Project initialized in ${folderPath}!`);
        const srcFolder = path.join(folderPath, 'src');
if (!fs.existsSync(srcFolder)) {
    fs.mkdirSync(srcFolder, { recursive: true });
}

        const lastFolderName = path.basename(folderPath);
        const mainRsPath = path.join(folderPath, 'src', 'main.rs');
        const mainRsContent = `/*
By: <Your Name Here>
Date: ${date}
Program Details: <Program Description Here>
*/
use macroquad::prelude::*;

#[macroquad::main("${lastFolderName}")]
async fn main() {
    loop {
        clear_background(RED);

        draw_line(40.0, 40.0, 100.0, 200.0, 15.0, BLUE);
        draw_rectangle(screen_width() / 2.0 - 60.0, 100.0, 120.0, 60.0, GREEN);

        draw_text("Hello, Macroquad!", 20.0, 20.0, 30.0, DARKGRAY);

        next_frame().await;
    }
}
`;
        fs.writeFileSync(mainRsPath, mainRsContent);    
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
                html, body, canvas { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: black; }
            </style>
        </head>
        <body>
            <canvas id="glcanvas" tabindex='1'></canvas>
            <script src="https://not-fl3.github.io/miniquad-samples/mq_js_bundle.js"></script>
            <script>load("target/wasm32-unknown-unknown/release/${lastFolderName}.wasm");</script>
        </body>
        </html>
        `;

        fs.writeFileSync(path.join(folderPath, 'index.html'), indexHtmlContent);
        vscode.window.showInformationMessage(`Adding Web Support in: ${folderPath}`);
    });


    let disposableButtons = vscode.commands.registerCommand('extension.addButtonSupport', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/buttons.rs';
       
        await downloadToFolder('objects', 'buttons.rs', url);
        vscode.window.showInformationMessage(`Adding Button Object in: ${folderPath}`);
    });


    let disposableTextInput = vscode.commands.registerCommand('extension.addTextInputSupport', async () => {
        const url = 'https://raw.githubusercontent.com/Mathew-D/rust-objects/main/inputs.rs';
    
        await downloadToFolder('objects', 'textInput.rs', url);
        vscode.window.showInformationMessage(`Adding Text Input Object in: ${folderPath}`);
    });

    // Add commands to the context subscriptions
    context.subscriptions.push(
        disposableShowMenu,
        disposableCreateRust,
        disposableAddWebSupport,
        disposableTextInput,
        disposableButtons
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
            vscode.window.showInformationMessage(`${path.basename(targetPath)} downloaded successfully!`);
        });
    }).on('error', (err) => {
        vscode.window.showErrorMessage(`Download failed: ${err.message}`);
    });
}

async function downloadToFolder(folderName, fileName, url) {
    const folderPath = await getFolderPath();
    if (!folderPath) {
        vscode.window.showErrorMessage('No folder is open. Please open a folder first.');
        return;
    }

    const objectsPath = path.join(folderPath, folderName);
    if (!fs.existsSync(objectsPath)) {
        fs.mkdirSync(objectsPath, { recursive: true });
    }

    const filePath = path.join(objectsPath, fileName);
    downloadFile(url, filePath);
}


function deactivate() { }

module.exports = {
    activate,
    deactivate
};
