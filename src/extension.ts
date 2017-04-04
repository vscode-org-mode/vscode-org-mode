'use strict';
import * as vscode from 'vscode';
import * as HeaderFunctions from './header-functions';

export function activate(context: vscode.ExtensionContext) {
    let insertSiblingCmd = vscode.commands.registerTextEditorCommand('extension.insertSibling', HeaderFunctions.insertSibling);

    let insertChildCmd = vscode.commands.registerTextEditorCommand('extension.insertChild', (textEditor, edit) => {
        vscode.window.showInformationMessage('Inserting Child');
    });

    context.subscriptions.push(insertSiblingCmd);
    context.subscriptions.push(insertChildCmd);
}

export function deactivate() {
}