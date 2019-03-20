import * as vscode from 'vscode'
import * as path from 'path'


export class WelcomePanel {
    
    public static currentPanel: WelcomePanel | undefined;

    public static readonly viewType = 'welcomePanel';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        if (WelcomePanel.currentPanel) {
            WelcomePanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(WelcomePanel.viewType, "Welcome to Orgmode", column || vscode.ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                vscode.Uri.file(path.join(extensionPath, 'media'))
            ]
        });

        WelcomePanel.currentPanel = new WelcomePanel(panel, extensionPath);
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        WelcomePanel.currentPanel = new WelcomePanel(panel, extensionPath);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        extensionPath: string
    ) {
        this._panel = panel;
        this._extensionPath = extensionPath;

        // Set the webview's initial html content 
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update()
            }
        }, null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, null, this._disposables);
    }

    // public doRefactor() {
    //     // Send a message to the webview webview.
    //     // You can send any JSON serializable data.
    //     this._panel.webview.postMessage({ command: 'refactor' });
    // }

    public dispose() {
        WelcomePanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {

        // const z = 1 + 2;
        // // Vary the webview's content based on where it is located in the editor.
        // switch (this._panel.viewColumn) {
        //     case vscode.ViewColumn.Two:
        //         this._updateForCat('Compiling Cat');
        //         return;

        //     case vscode.ViewColumn.Three:
        //         this._updateForCat('Testing Cat');
        //         return;

        //     case vscode.ViewColumn.One:
        //     default:
        //         this._updateForCat('Coding Cat');
        //         return;
        // }
        this._panel.webview.html = this._getHtmlForWebview();
    }

    // private _updateForCat(catName: keyof typeof cats) {
    //     this._panel.title = catName;
    //     this._panel.webview.html = this._getHtmlForWebview(cats[catName]);
    // }

    private _getHtmlForWebview(/*catGif: string*/) {

        //// Local path to main script run in the webview
        //const scriptPathOnDisk = vscode.Uri.file(path.join(__dirname, 'welcome', 'index.js'));

        //// And the uri we use to load this script in the webview
        //const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Org Mode</title>
            </head>
            <body>
                <!--<img src="\${catGif}" width="300" />-->
                <h1 id="lines-of-code-counter">Welcome to Org Mode</h1>
                <p>Org for the Best</p>
                <script nonce="${nonce}" src="\${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}