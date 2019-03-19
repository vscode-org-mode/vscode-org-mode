import * as vscode from 'vscode';
import * as Utils from './utils';

export function promoteSubtree(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const curLine = Utils.getLine(textEditor.document, cursorPos);
    const headerPrefix = Utils.getHeaderPrefix(curLine);

    const endOfContent = Utils.findEndOfContent(document, cursorPos, headerPrefix);

    if(headerPrefix) {
        for(let i = cursorPos.line; i < endOfContent.line + 1; ++i) {
            const curlineStart = new vscode.Position(i, 0);
            const lineHeaderPrefix = Utils.getHeaderPrefix(Utils.getLine(document, curlineStart));
            if(lineHeaderPrefix) {
                if(Utils.getStarPrefixCount(lineHeaderPrefix) > 1) {
                    edit.delete(new vscode.Range(curlineStart, new vscode.Position(i, 1)));
                }
            }
        }
    }
}

export function demoteSubtree(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const curLine = Utils.getLine(textEditor.document, cursorPos);
    const headerPrefix = Utils.getHeaderPrefix(curLine);

    const endOfContent = Utils.findEndOfContent(document, cursorPos, headerPrefix);

    if(headerPrefix) {
        for(let i = cursorPos.line; i < endOfContent.line + 1; ++i) {
            const curlineStart = new vscode.Position(i, 0);
            if(Utils.getHeaderPrefix(Utils.getLine(document, curlineStart))) {
                edit.insert(curlineStart, "*");
            }
        }
    }
}