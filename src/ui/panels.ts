import * as vscode from 'vscode'
import * as path from 'path'
import { PanelType } from './panel'

export const WelcomePanel: PanelType = {
    title: 'Welcome to org Mode',
    viewType: 'org.welcome',
    getHtml() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-\${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Org Mode</title>
            </head>
            <body>
                <h1>Welcome to Org Mode</h1>
                <p>Org for the Best</p>
                <script nonce="\${nonce}" src="\${scriptUri}"></script>
            </body>
            </html>`;
    }
}
export const UpgradePanel: PanelType = {
    title: 'org Mode needs to be Upgraded',
    viewType: 'org.upgrade',
    getHtml() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-\${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Org Mode Upgrade Needed</title>
            </head>
            <body>
                <h1">Org Mode version is outdated</h1>
                <p>Org for the Best</p>
                <script nonce="\${nonce}" src="\${scriptUri}"></script>
            </body>
            </html>`;
    }
}