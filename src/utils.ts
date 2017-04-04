import * as vscode from 'vscode';

export function getCursorPosition() {
    const curEditor = vscode.window.activeTextEditor;
    return curEditor.selection.active;
}

export function insertText(edit: vscode.TextEditorEdit, position: vscode.Position, text: string) {
    const document = vscode.window.activeTextEditor.document;
    edit.insert(position, text);     //lead with \n to place on next line
}

export function getActiveTextEditorEdit() {
    return vscode.window.activeTextEditor.document;
}

export function getLine(document: vscode.TextDocument, lineNum: vscode.Position) {
    return document.lineAt(lineNum).text;
}

export function getHeaderPrefix(line: string) {
    return line.match(/^\*+/);
}

export function findPreviousHeader() {
    
}