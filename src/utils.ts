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

export function findBeginningOfSectionWithHeader(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    let beginningOfSection = findBeginningOfSection(document, pos, levelSym);
    let prevLineNum = beginningOfSection.line - 1;
    if(prevLineNum >= 0 && document.lineAt(prevLineNum).text.match(/^\*+\s/)) {
        return new vscode.Position(prevLineNum, 0);
    }
    return beginningOfSection;
}

export function findBeginningOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    let sectionRegex = getSectionRegex(levelSym);

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine--;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while(curLine > 0 && inSubsection(curLinePrefix, sectionRegex))

    if(curPos) {
        curPos = new vscode.Position(curPos.line + 1, 0);
    }

    return curPos;
}

export function findEndOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    if(pos.line === document.lineCount - 1) {
        return pos;
    }
    let sectionRegex = getSectionRegex(levelSym);

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine++;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while(curLine < document.lineCount - 1 && inSubsection(curLinePrefix, sectionRegex))

    curPos = new vscode.Position(curPos.line - 1, getLine(document, new vscode.Position(curPos.line - 1, 0)).length + 1);

    return curPos;
}

//TODO: write findEndOfSection
export function findEndOfContent(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    if(pos.line === document.lineCount - 1) {
        return pos;
    }
    let sectionRegex = getSectionRegex(levelSym);
    if(levelSym.startsWith("*")) {      //add an extra star so that content stops at next header of same level
        let numStars = getStarPrefixCount(levelSym) + 1;
        sectionRegex = new RegExp(`\\*{${numStars},}`);
    }

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine++;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while(curLine < document.lineCount - 1 && inSubsection(curLinePrefix, sectionRegex))

    if(curLine !== document.lineCount - 1) {
        curPos = new vscode.Position(curPos.line - 1, getLine(document, new vscode.Position(curPos.line - 1, 0)).length + 1);
    } else {
        curPos = new vscode.Position(curPos.line, getLine(document, new vscode.Position(curPos.line, 0)).length + 1);
    }


    return curPos;
}

export function inSubsection(linePrefix: string, sectionRegex: RegExp) {
    return (linePrefix.match(sectionRegex)) || linePrefix === "-" || !linePrefix || linePrefix.match(/\d+\./);
}

//returns regex that will match a subsection and facilitate respecting section content
export function getSectionRegex(prefix: string) {
    let regex = null;
    if(prefix.match(/\d+./)) {    //starting on numeric line
        regex = /\d+./;
    }
    else if(prefix === "") {      //starting on other non-header text line
        regex = /^$/;
    }
    else if(prefix === "-") {
        regex = /^-\s$/;
    }
    else if(prefix.startsWith("*")) {                          //starting on header line
        let numStars = getStarPrefixCount(prefix);
        regex = new RegExp(`\\*{${numStars},}`);
    }

    return regex;
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
