import * as vscode from 'vscode';
import * as Datetime from './simple-datetime';
import * as Util from './utils';

// Any potential data labels should go here (eg TODO)
export const DATE = "DATE";

export default function getCursorContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = Util.getActiveTextEditorEdit();
    const cursorPos = Util.getCursorPosition();
    const curLine = Util.getLine(document, cursorPos);
    const line = cursorPos.line;

    const contextData = {
        dataLabel: undefined,
        data: undefined,
        line: undefined,
        range: undefined
    }

    // Match for timestamp
    // const timestampRegexp = /2/g
    const timestampRegexp = /\[\d{4}-\d{1,2}-\d{1,2}(?: \w{3})?\]/g
    let match;
    while ((match = timestampRegexp.exec(curLine)) != null) {
        const startPos = new vscode.Position(line, match.index);
        const endPos = new vscode.Position(line, match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        if (range.contains(cursorPos)) {
            // We've found our match
            contextData.dataLabel = DATE;
            contextData.data = match[0];
            contextData.line = line;
            contextData.range = range;
            return contextData;
        }
    }

    // Any different matches or catch-all matches should go here

    return undefined;
}