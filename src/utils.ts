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
    if (prefix) {
        return prefix[0].trim();
    }
    else {
        return "";
    }
}

/**
 * Extract title name from a header line
 * @param line the content of the header line
 * @return the title name
 */
export function getHeaderTitle(line: string): string {
    return line.substr(line.indexOf(' ') + 1);
}

export function getPrefix(line: string) {
    const prefix = line.match(/^\*+|^-\s|^\d+\./);
    if (prefix) {
        return prefix[0].trim();
    }
    else {
        return "";
    }
}

export function findParentPrefix(document: vscode.TextDocument, pos: vscode.Position) {
    const thisLinePrefix = getHeaderPrefix(getLine(document, pos));
    let curLine = pos.line;
    let curLinePrefix = "";

    while (curLine > 0 && curLinePrefix === thisLinePrefix) {
        curLine--;
        const curLineContent = getLine(document, new vscode.Position(curLine, 0));
        curLinePrefix = getHeaderPrefix(curLineContent);
    }

    return curLinePrefix;
}

export function findBeginningOfSectionWithHeader(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    const beginningOfSection = findBeginningOfSection(document, pos, levelSym);
    const prevLineNum = beginningOfSection.line - 1;
    if (prevLineNum >= 0 && document.lineAt(prevLineNum).text.match(/^\*+\s/)) {
        return new vscode.Position(prevLineNum, 0);
    }
    return beginningOfSection;
}

export function findBeginningOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    const sectionRegex = getSectionRegex(levelSym);

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine--;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while (curLine > 0 && inSubsection(curLinePrefix, sectionRegex))

    if (curPos) {
        curPos = new vscode.Position(curPos.line + 1, 0);
    }

    return curPos;
}

export function findEndOfSection(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    if (pos.line === document.lineCount - 1) {
        return pos;
    }
    const sectionRegex = getSectionRegex(levelSym);

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine++;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while (curLine < document.lineCount - 1 && inSubsection(curLinePrefix, sectionRegex))

    curPos = new vscode.Position(curPos.line - 1, getLine(document, new vscode.Position(curPos.line - 1, 0)).length + 1);

    return curPos;
}

// TODO: write findEndOfSection
export function findEndOfContent(document: vscode.TextDocument, pos: vscode.Position, levelSym: string = "") {
    if (pos.line === document.lineCount - 1) {
        return new vscode.Position(pos.line, getLine(document, pos).length);
    }
    let sectionRegex = getSectionRegex(levelSym);
    if (levelSym.startsWith("*")) {      // add an extra star so that content stops at next header of same level
        const numStars = getStarPrefixCount(levelSym) + 1;
        sectionRegex = new RegExp(`\\*{${numStars},}`);
    }

    let curLine = pos.line;
    let curPos;
    let curLinePrefix;

    do {
        curLine++;
        curPos = new vscode.Position(curLine, 0);
        curLinePrefix = getPrefix(getLine(document, curPos));
    } while (curLine < document.lineCount - 1 && inSubsection(curLinePrefix, sectionRegex))


    return (curLine !== document.lineCount - 1) ? new vscode.Position(curPos.line - 1, getLine(document, new vscode.Position(curPos.line - 1, 0)).length + 1) :
        new vscode.Position(curPos.line, getLine(document, new vscode.Position(curPos.line, 0)).length + 1);

}

export function inSubsection(linePrefix: string, sectionRegex: RegExp) {
    return (linePrefix.match(sectionRegex)) || linePrefix === "-" || !linePrefix || linePrefix.match(/\d+\./);
}

// returns regex that will match a subsection and facilitate respecting section content
export function getSectionRegex(prefix: string) {
    let regex = null;
    if (prefix.match(/\d+./)) {    // starting on numeric line
        regex = /\d+./;
    }
    else if (prefix === "") {      // starting on other non-header text line
        regex = /^$/;
    }
    else if (prefix === "-") {
        regex = /^-\s$/;
    }
    else if (prefix.startsWith("*")) {                          // starting on header line
        const numStars = getStarPrefixCount(prefix);
        regex = new RegExp(`\\*{${numStars},}`);
    }

    return regex;
}

/**
 * Computes and returns the star number at the beginning of the line.
 * Examples: <br>
 * "*** Header" returns 3, <br>
 * "** * Header" returns 2, <br>
 * " *** Header" returns 0. <br>
 * @param prefix a string
 * @return the number of stars reached at the beginning of the specified string before encountering any other character.
 */
export function getStarPrefixCount(prefix: string) {
    let currentLevel = -1;
    while (prefix[++currentLevel] === '*') { ; }
    return currentLevel;
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

// pos is a position anywhere on the target line
export function moveToEndOfLine(editor: vscode.TextEditor, pos: vscode.Position) {
    const curLine = getLine(editor.document, pos);
    const endOfLine = curLine.length;
    const endOfLinePos = new vscode.Position(pos.line, endOfLine);
    editor.selections = [new vscode.Selection(endOfLinePos, endOfLinePos)];
}

export function getKeywords() {
    const settings = vscode.workspace.getConfiguration("org");
    const todoKeywords = settings.get<string[]>("todoKeywords");
    todoKeywords.push(""); // Since 'nothing' can be a TODO
    return todoKeywords;
}

export function getLeftZero() {
    const settings = vscode.workspace.getConfiguration("org");
    const addLeftZero = settings.get<boolean>("addLeftZero");
    return addLeftZero;
}

export function getClockInOutSeparator() {
    const settings = vscode.workspace.getConfiguration("org");
    const clockInOutSeparator = settings.get<string>("clockInOutSeparator");
    return clockInOutSeparator;
}

export function getClockTotalSeparator() {
    const settings = vscode.workspace.getConfiguration("org");
    const clockTotalSeparator = settings.get<string>("clockTotalSeparator");
    return clockTotalSeparator;
}

export function getUniq(arr: string[]): string[] {
    // Must also preserve order
    const map = {};
    const uniq = [];

    arr.forEach(el => {
        if (!map[el]) {
            uniq.push(el);
        }
        map[el] = true;
    });

    return uniq;
}

/**
 * Check if the line is a block end.
 * @param line The textual representation of the line.
 * @return true if the specified line is a block end, false otherwise.
 */
export function isBlockEndLine(line: string): boolean {
    return /^\s*#\+END(_|:)/i.test(line);
}

/**
 * Check if the line is a block start.
 * @param line The textual representation of the line.
 * @return true if the specified line is a block, false otherwise.
 */
export function isBlockStartLine(line: string): boolean {
    return /^\s*#\+BEGIN(_|:)/i.test(line);
}

/**
 * Check if the line is a header.
 * @param line The textual representation of the line.
 * @return true if the specified line is a header, false otherwise.
 */
export function isHeaderLine(line: string): boolean {
    return /^\*+ /.test(line);
}
