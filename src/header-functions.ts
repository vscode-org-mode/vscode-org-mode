import * as vscode from 'vscode';
import * as Utils from './utils';

export function insertSibling(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        const document = Utils.getActiveTextEditorEdit();
        const cursorPos = Utils.getCursorPosition();
        const curLine = Utils.getLine(document, cursorPos);
        const endOfLine = curLine.length;
        const insertPos = new vscode.Position(cursorPos.line, endOfLine);

        let sibling;
        let headerMatch = Utils.getHeaderPrefix(curLine);

        if(headerMatch) {
            sibling = "\n" + headerMatch[0] + " ";
        }

        if(sibling)
            Utils.insertText(edit, insertPos, sibling);
}