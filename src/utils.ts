import * as vscode from 'vscode';

export function getCursorPosition() {
    const curEditor = vscode.window.activeTextEditor;
    return curEditor.selection.active;
}

export function insertText(edit: vscode.TextEditorEdit) {
    let cursorPos = getCursorPosition();
    edit.insert(cursorPos, "--asdf--");
}