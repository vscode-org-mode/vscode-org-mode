import * as vscode from 'vscode';
import * as Utils from './utils';

export function promoteSubtree(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = textEditor.document;
    const cursorPos = Utils.getCursorPosition();
    const curLine = Utils.getLine(textEditor.document, cursorPos);
    let prefix = Utils.getPrefix(curLine);

    let beginningOfSection = Utils.findBeginningOfSection(document, cursorPos, prefix);
    let endOfSection = Utils.findEndOfSection(document, cursorPos, prefix);

    //if on header
    //if not on header
}