import * as vscode from 'vscode';

export function getCursorPosition() {
    const curEditor = vscode.window.activeTextEditor;
    return curEditor.selection.active;
}


export function getActiveTextEditorEdit() {
    return vscode.window.activeTextEditor.document;
}

export function getLine(document: vscode.TextDocument, lineNum: vscode.Position) {
    return document.lineAt(lineNum).text;
}

export function getHeaderPrefix(line: string) {
    const prefix = line.match(/^\*+/);
    if(prefix) {
        return prefix[0];
    }
    else {
        return "";
    }
}


export function getPrefix(line: string) {
    const prefix = line.match(/^\*+|^[-]\s|^\d+\./);
    if(prefix) {
        return prefix[0];
    }
    else {
        return "";
    }
}

export function findParentPrefix(document: vscode.TextDocument, pos: vscode.Position) {
    let thisLinePrefix = getHeaderPrefix(getLine(document, pos));
    let curLine = pos.line;
    let curLinePrefix = "";

    //figure out why it goes all the way up to single star
    while(curLine >= 0 && curLinePrefix == thisLinePrefix) {
        curLine--;
        let curLineContent = getLine(document, new vscode.Position(curLine, 0));
        curLinePrefix = getHeaderPrefix(curLineContent);
    }

    return curLinePrefix;
}

export function findEndOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    let matchSym;
    if(levelSym.match(/\d+./)) {
        matchSym = /\d+./;
    }
    else if(levelSym === "") {
        matchSym = /^$/;
    }
    else {
        matchSym = levelSym;
    }
    let curLine = pos.line;
    let curPos = new vscode.Position(pos.line, 0);      //set to line: curLine and character: <end of line>
    let curLinePrefix = levelSym;

    while(curLine <= document.lineCount && curLinePrefix.match(matchSym)) {
        curLine++;
        curPos = new vscode.Position(curLine, 0);
        let curLineContent = getLine(document, curPos);
        curLinePrefix = getPrefix(curLineContent);
    }


    curPos = new vscode.Position(curPos.line - 1, getLine(document, new vscode.Position(curPos.line - 1, 0)).length + 1);

    return curPos;
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
    const insertPos = new vscode.Position(cursorPos.line, 0);
    edit.insert(insertPos, prependingText);
}
