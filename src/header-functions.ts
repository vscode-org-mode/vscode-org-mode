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
            let parentHeader = Utils.findParentPrefix(document, cursorPos);
            sibling = "\n" + parentHeader + " ";

            insertPos = Utils.findEndOfSection(document, cursorPos, Utils.getPrefix(curLine));
        }

        if(sibling)
            edit.insert(insertPos, sibling);
}

export function insertChild(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const curLine = Utils.getLine(textEditor.document, cursorPos);
    const endOfLine = curLine.length;
    let headerPrefix = Utils.getHeaderPrefix(curLine);
    let insertPos = new vscode.Position(cursorPos.line, endOfLine);

    if(headerPrefix) {
        edit.insert(insertPos, "\n" + headerPrefix.trim() + "* ");
    }
}

export function demoteLine(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const curLine = Utils.getLine(textEditor.document, cursorPos);
    let headerPrefix = Utils.getHeaderPrefix(curLine);
    let insertPos = new vscode.Position(cursorPos.line, 0);
    if(headerPrefix) {
        edit.insert(insertPos, "*");
    }
}

export function promoteLine(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const curLine = Utils.getLine(textEditor.document, cursorPos);
    let headerPrefix = Utils.getHeaderPrefix(curLine);
    let insertPos = new vscode.Position(cursorPos.line, 0);

    if(headerPrefix) {
        let deleteRange = new vscode.Range(insertPos, new vscode.Position(insertPos.line, 1));
        edit.delete(deleteRange);
    }
}