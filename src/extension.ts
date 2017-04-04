'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.testLog', () => {
        vscode.window.showInformationMessage('Command Works');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}