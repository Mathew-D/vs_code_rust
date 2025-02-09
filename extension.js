const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process'); // ✅ Import exec

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.generateRustStructure', function (uri) {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('Please right-click on a folder to generate the code structure.');
            return;
        }

        const folderPath = uri.fsPath;
        const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        const lastFolderName = path.basename(folderPath);

        const stats = fs.lstatSync(folderPath);
        if (!stats.isDirectory()) {
            vscode.window.showErrorMessage('The selected path is not a folder!');
            return;
        }

        vscode.window.showInformationMessage(`Initializing Cargo project in ${folderPath}...`);

        // ✅ Run `cargo init` first
        exec('cargo init', { cwd: folderPath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error initializing Cargo: ${stderr}`);
                return;
            }

            vscode.window.showInformationMessage(`Cargo project initialized in ${folderPath}!`);

            // ✅ Run `cargo add macroquad` next
            exec('cargo add macroquad', { cwd: folderPath }, (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error adding macroquad: ${stderr}`);
                    return;
                }

                vscode.window.showInformationMessage('macroquad added successfully!');

                // ✅ Now create the `index.html` file
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

                // ✅ Now modify `main.rs`
                const mainRsPath = path.join(folderPath, 'src', 'main.rs');
                const mainRsContent = `
/*
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

                // ✅ Show final success message
                vscode.window.showInformationMessage('Rust project with Macroquad set up successfully!');
            });
        });
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
