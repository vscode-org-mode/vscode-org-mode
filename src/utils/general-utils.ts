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
    const prefix = line.match(/^\*+\s/);
    if(prefix) {
        return prefix[0].trim();
    }
    else {
        return "";
    }
}

export function getPrefix(line: string) {
    const prefix = line.match(/^\*+|^-\s|^\d+\./);
    if(prefix) {
        return prefix[0].trim();
    }
    else {
        return "";
    }
}

export function findParentPrefix(document: vscode.TextDocument, pos: vscode.Position) {
    let thisLinePrefix = getHeaderPrefix(getLine(document, pos));
    let curLine = pos.line;
    let curLinePrefix = "";

    while(curLine > 0 && curLinePrefix === thisLinePrefix) {
        curLine--;
        let curLineContent = getLine(document, new vscode.Position(curLine, 0));
        curLinePrefix = getHeaderPrefix(curLineContent);
    }

    return curLinePrefix;
}

export function inSubsection(linePrefix: string, sectionRegex: RegExp) {
    return (linePrefix.match(sectionRegex)) || linePrefix === "-" || !linePrefix || linePrefix.match(/\d+\./);
}

export function getStarPrefixCount(prefix: string) {
    if(!prefix.startsWith("*")) {
        return 0;
    }

    let starMatch = prefix.match(/\*+/);
    return starMatch[0].length;
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

//pos is a position anywhere on the target line
export function moveToEndOfLine(editor: vscode.TextEditor, pos: vscode.Position) {
    const curLine = getLine(editor.document, pos);
    const endOfLine = curLine.length;
    const endOfLinePos = new vscode.Position(pos.line, endOfLine);
    editor.selections = [new vscode.Selection(endOfLinePos, endOfLinePos)];
}

export function getKeywords() {
    const settings = vscode.workspace.getConfiguration("org");
    let todoKeywords = settings.get<string[]>("todoKeywords");
    todoKeywords.push(""); // Since 'nothing' can be a TODO
    return todoKeywords;
}

export function getLeftZero() {
    const settings = vscode.workspace.getConfiguration("org");
    let addLeftZero = settings.get<boolean>("addLeftZero");
    return addLeftZero;
}

export function getClockInOutSeparator() {
    const settings = vscode.workspace.getConfiguration("org");
    let clockInOutSeparator = settings.get<string>("clockInOutSeparator");
    return clockInOutSeparator;
}

export function getClockTotalSeparator() {
    const settings = vscode.workspace.getConfiguration("org");
    let clockTotalSeparator = settings.get<string>("clockTotalSeparator");
    return clockTotalSeparator;
}

export function getUniq(arr: string[]): string[] {
    // Must also preserve order
    let map = {};
    let uniq = [];

    arr.forEach(el => {
        if (!map[el]) {
            uniq.push(el);
        }
        map[el] = true;
    });

    return uniq;
}
