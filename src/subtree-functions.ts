import * as vscode from 'vscode';
import * as Utils from './utils/general-utils';
import {findEndOfContent} from './utils/content-utils';

export function promoteSubtree(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    let curLine = Utils.getLine(textEditor.document, cursorPos);
    let headerPrefix = Utils.getHeaderPrefix(curLine);

    let endOfContent = findEndOfContent(document, cursorPos, headerPrefix);

    if(headerPrefix) {
        for(let i = cursorPos.line; i < endOfContent.line + 1; ++i) {
            let curlineStart = new vscode.Position(i, 0);
            let lineHeaderPrefix = Utils.getHeaderPrefix(Utils.getLine(document, curlineStart));
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
    let curLine = Utils.getLine(textEditor.document, cursorPos);
    let headerPrefix = Utils.getHeaderPrefix(curLine);

    let endOfContent = findEndOfContent(document, cursorPos, headerPrefix);

    if(headerPrefix) {
        for(let i = cursorPos.line; i < endOfContent.line + 1; ++i) {
            let curlineStart = new vscode.Position(i, 0);
            if(Utils.getHeaderPrefix(Utils.getLine(document, curlineStart))) {
                edit.insert(curlineStart, "*");
            }
        }
    }
}