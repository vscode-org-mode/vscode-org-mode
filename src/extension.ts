'use strict';
import * as vscode from 'vscode';
import * as Util from './utils';
import * as HeaderFunctions from './header-functions';
import * as DatetimeFunctions from './datetime-functions';

export function activate(context: vscode.ExtensionContext) {
    let insertSiblingCmd = vscode.commands.registerTextEditorCommand('extension.insertSibling', HeaderFunctions.insertSibling);

    let insertChildCmd = vscode.commands.registerTextEditorCommand('extension.insertChild', (textEditor, edit) => {
        vscode.window.showInformationMessage('Inserting Child');
    });

    let insertDateCmd = vscode.commands.registerTextEditorCommand('extension.insertDate', (textEditor, edit) => {
      vscode.window.showInformationMessage('Inserting Date');
      DatetimeFunctions.insertDate(textEditor, edit);
    });

    context.subscriptions.push(insertSiblingCmd);
    context.subscriptions.push(insertChildCmd);
    context.subscriptions.push(insertDateCmd);
}

export function deactivate() {
}