'use strict';
import * as vscode from 'vscode';
import * as Utils from './utils';

export function activate(context: vscode.ExtensionContext) {
    let insertSiblingCmd = vscode.commands.registerTextEditorCommand('extension.insertSibling', (textEditor, edit) => {
        Utils.insertText(edit);
        vscode.window.showInformationMessage('Inserting Sibling');
    });

    let insertChildCmd = vscode.commands.registerTextEditorCommand('extension.insertChild', (textEditor, edit) => {
        vscode.window.showInformationMessage('Inserting Child');
    });

    context.subscriptions.push(insertSiblingCmd);
    context.subscriptions.push(insertChildCmd);
}

export function deactivate() {
}