import * as vscode from 'vscode';

export function getCursorPosition() {
    const curEditor = vscode.window.activeTextEditor;
    return curEditor.selection.active;
}

