import * as vscode from 'vscode';
import * as Utils from './utils';

export function insertSibling(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        const document = textEditor.document;
        const cursorPos = Utils.getCursorPosition();
        const curLine = Utils.getLine(document, cursorPos);
        const endOfLine = curLine.length;
        let insertPos = new vscode.Position(cursorPos.line, endOfLine);

        let sibling;
        let headerMatch = Utils.getHeaderPrefix(curLine);

        if(headerMatch) {
            sibling = "\n" + headerMatch + " ";
        } else {
            //find the previous header
            let parentHeader = Utils.findParentPrefix(document, cursorPos);
            sibling = "\n" + parentHeader + " ";

            //update insertPos
            insertPos = Utils.findEndOfSection(document, cursorPos, Utils.getPrefix(curLine));
        }

        if(sibling)
            edit.insert(insertPos, sibling);
}