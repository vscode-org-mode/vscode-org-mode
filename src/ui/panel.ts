import * as vscode from 'vscode'
import * as path from 'path'


export type PanelType = {
    title: string;
    viewType: string;
    getBody: () => string;
    scriptUri?: string;
}

export class Panel {

    public static currentPanels: Map<PanelType, Panel> = new Map();

    // public static readonly viewType = 'welcomePanel';

    private readonly _panelType: PanelType;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(panelType: PanelType, extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        // If we already have a panel, show it.
        if (Panel.currentPanels && Panel.currentPanels.has(panelType)) {
            Panel.currentPanels.get(panelType)._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(panelType.viewType, panelType.title, column || vscode.ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,

            // And restric the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [
                // §FIXME: update
                vscode.Uri.file(path.join(extensionPath, 'media'))
            ]
        });

        Panel.currentPanels.set(panelType, new Panel(panelType, panel, extensionPath));
    }

    public static revive(panelType: PanelType, panel: vscode.WebviewPanel, extensionPath: string) {
        Panel.currentPanels.set(panelType, new Panel(panelType, panel, extensionPath));
    }

    private constructor(
        panelType: PanelType,
        panel: vscode.WebviewPanel,
        extensionPath: string
    ) {
        this._panelType = panelType;
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

    public dispose() {
        Panel.currentPanels.delete(this._panelType);
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const nonce = getNonce();
        this._panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${this._panelType.title}</title>
            </head>
            <body>
            ${this._panelType.getBody()}
            ${this._panelType.scriptUri ? `<script nonce="${nonce}" src="${this._panelType.scriptUri}"></script>` :''}
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