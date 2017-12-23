import * as vscode from 'vscode';
import {getLine, getPrefix, getStarPrefixCount, inSubsection} from './general-utils';
import {getSectionRegex} from './section-utils';

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