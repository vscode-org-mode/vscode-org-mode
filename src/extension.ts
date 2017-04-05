'use strict';
import * as vscode from 'vscode';
import * as HeaderFunctions from './header-functions';
import * as TimestampFunctions from './timestamp-functions';

export function activate(context: vscode.ExtensionContext) {
    let insertSiblingCmd = vscode.commands.registerTextEditorCommand('extension.insertSibling', HeaderFunctions.insertSibling);
    let insertChildCmd = vscode.commands.registerTextEditorCommand('extension.insertChild', (textEditor, edit) => {
        vscode.window.showInformationMessage('Inserting Child');
    });

    let insertTimestampCmd = vscode.commands.registerTextEditorCommand('extension.insertTimestamp', (textEditor, edit) => {
      vscode.window.showInformationMessage('Inserting Date');
      TimestampFunctions.insertTimestamp(textEditor, edit);
    });

    context.subscriptions.push(insertSiblingCmd);
    context.subscriptions.push(insertChildCmd);
    context.subscriptions.push(insertTimestampCmd);
}

export function deactivate() {
}