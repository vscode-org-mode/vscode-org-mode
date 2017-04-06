// import * as vscode from 'vscode';
import {
    TextEditor,
    TextEditorEdit,
    Position,
    Range
} from "vscode";
import * as Datetime from './simple-datetime';
import * as Util from './utils';

// Any potential data labels should go here
export const DATE = "DATE";
export const TODO = "TODO";

interface IContextData {
    dataLabel: string,
    data: string,
    line: number,
    range: Range
}

export default function getCursorContext(textEditor: TextEditor, edit: TextEditorEdit): IContextData {
    const document = Util.getActiveTextEditorEdit();
    const cursorPos = Util.getCursorPosition();
    const curLine = Util.getLine(document, cursorPos);

    // Match for timestamp
    const timestampRegexp = /\[\d{4}-\d{1,2}-\d{1,2}(?: \w{3})?\]/g;
    let match;
    while ((match = timestampRegexp.exec(curLine)) != null) {
        const timestampContext = getTimestampContext(match, cursorPos);
        if (timestampContext) {
            return timestampContext;
        }
    }

    // Match for TODO (or absence)
    const todoWords = "TODO|DONE";
    const todoHeaderRegexp = new RegExp(`^(\*+ )(${todoWords}|)\b`);
    match = todoHeaderRegexp.exec(curLine);
    if (match) {
        // We've found our match
        return getTodoContext(match, cursorPos);
    }

    return undefined;
}

function getTimestampContext(match: RegExpExecArray, cursorPos: Position): IContextData {
    const line = cursorPos.line;

    const startPos = new Position(line, match.index);
    const endPos = new Position(line, match.index + match[0].length);
    const range = new Range(startPos, endPos);
    if (range.contains(cursorPos)) {
        // We've found our match
        return {
            dataLabel: DATE,
            data: match[0],
            line: line,
            range: range
        }
    }

    // Should return undefined if no match contains the cursor
}

function getTodoContext(match: RegExpExecArray, cursorPos: Position): IContextData {
    const line = cursorPos.line;

    const prefix = match[1];
    const todoWord = match[2];

    const start = match.index + match[1].length;
    const startPos = new Position(line, start);
    const end = start + todoWord.length;
    const endPos = new Position(line, end);
    const range = new Range(startPos, endPos);

    return {
        dataLabel: "Todo",
        data: todoWord,
        line: line,
        range: range
    }
}