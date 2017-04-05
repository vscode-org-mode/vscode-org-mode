'use strict';
import * as vscode from 'vscode';
import * as HeaderFunctions from './header-functions';
import * as TimestampFunctions from './timestamp-functions';
import * as MarkupFunctions from './markup-functions';

export function activate(context: vscode.ExtensionContext) {
    let insertSiblingCmd = vscode.commands.registerTextEditorCommand('extension.insertSibling', HeaderFunctions.insertSibling);
    let insertChildCmd = vscode.commands.registerTextEditorCommand('extension.insertChild', HeaderFunctions.insertChild);
    let demoteLineCmd = vscode.commands.registerTextEditorCommand('extension.demoteLine', HeaderFunctions.demoteLine);
    let promoteLineCmd = vscode.commands.registerTextEditorCommand('extension.promoteLine', HeaderFunctions.promoteLine);

    let insertTimestampCmd = vscode.commands.registerTextEditorCommand('extension.insertTimestamp', (textEditor, edit) => {
      vscode.window.showInformationMessage('Inserting Date');
      TimestampFunctions.insertTimestamp(textEditor, edit);
    });

    const boldCmd = vscode.commands.registerTextEditorCommand('extension.bold', MarkupFunctions.bold);
    const italicCmd = vscode.commands.registerTextEditorCommand('extension.italic', MarkupFunctions.italic);
    const underlineCmd = vscode.commands.registerTextEditorCommand('extension.underline', MarkupFunctions.underline);
    const codeCmd = vscode.commands.registerTextEditorCommand('extension.code', MarkupFunctions.code);
    const verboseCmd = vscode.commands.registerTextEditorCommand('extension.verbose', MarkupFunctions.verbose);
    const literalCmd = vscode.commands.registerTextEditorCommand('extension.literal', MarkupFunctions.literal);

    context.subscriptions.push(insertSiblingCmd);
    context.subscriptions.push(insertChildCmd);
    context.subscriptions.push(demoteLineCmd);
    context.subscriptions.push(promoteLineCmd);
    context.subscriptions.push(insertTimestampCmd);
    context.subscriptions.push(boldCmd);
    context.subscriptions.push(italicCmd);
    context.subscriptions.push(underlineCmd);
    context.subscriptions.push(codeCmd);
    context.subscriptions.push(verboseCmd);
    context.subscriptions.push(literalCmd);
}

export function deactivate() {
}