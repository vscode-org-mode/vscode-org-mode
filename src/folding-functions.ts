import * as vscode from 'vscode';
import * as Utils from './utils';

export function fold(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const currentLine = Utils.getLine(document, cursorPos);
    const endOfSection = Utils.findEndOfSection(document, cursorPos);
    let lineCounter = cursorPos.line;
    const isHeader = Utils.getHeaderPrefix(currentLine);
    if (isHeader) { lineCounter++ }

    while (lineCounter <= endOfSection.line) {
        Utils.prependTextToSpecifiedLine(lineCounter, " ", edit)
        lineCounter++
    }

    vscode.commands.executeCommand('editor.fold');
}

export function unfold(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const currentLine = Utils.getLine(document, cursorPos);
    const endOfSection = Utils.findEndOfSection(document, cursorPos);
    let lineCounter = cursorPos.line;
    const isHeader = Utils.getHeaderPrefix(currentLine);
    if (isHeader) { lineCounter++ }

    while (lineCounter <= endOfSection.line) {
        Utils.trimSpecifiedLine(lineCounter, edit)
        lineCounter++
    }
}