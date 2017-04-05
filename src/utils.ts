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

export function surroundWithText(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, surroundingText: string, errorMessage: string) {
    const selection = vscode.window.activeTextEditor.selection;
    if (selection.isEmpty) {
        vscode.window.showErrorMessage(errorMessage);
    } else {
        edit.insert(selection.start, surroundingText);
        edit.insert(selection.end, surroundingText);
    }
}

export function prependTextToLine(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, prependingText: string) {
    const document = getActiveTextEditorEdit();
    const cursorPos = getCursorPosition();
    const curLine = getLine(document, cursorPos);
    const insertPos = new vscode.Position(cursorPos.line, 0)
    edit.insert(insertPos, prependingText)
}

