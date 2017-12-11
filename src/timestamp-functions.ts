import * as vscode from 'vscode';
import * as Utils from './utils';
import * as Datetime from './simple-datetime';

export function insertTimestamp(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = Utils.getActiveTextEditorEdit();
    const cursorPos = Utils.getCursorPosition();
    
    const dateObject = Datetime.currentDate();
    const dateString = Datetime.buildDateString(dateObject);

    edit.insert(cursorPos, dateString);
}

export function clockIn(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = Utils.getActiveTextEditorEdit();
    const cursorPos = Utils.getCursorPosition();
    const line = Utils.getLine(document, cursorPos);

    if (line.indexOf('CLOCK:') === -1) {
        edit.insert(cursorPos, 'CLOCK: ');
    }
    
    insertDateTime(edit, cursorPos);
}

export function clockOut(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = Utils.getActiveTextEditorEdit();
    const cursorPos = Utils.getCursorPosition();
    const line = Utils.getLine(document, cursorPos);

    const separator = Utils.getClockInOutSeparator();
    const separatorIndex = line.indexOf(separator);
    if (separatorIndex !== -1) {
        const initPos = new vscode.Position(cursorPos.line, separatorIndex);
        const endPos = new vscode.Position(cursorPos.line, line.length);
        const range = new vscode.Range(initPos, endPos);
        edit.replace(range, '');
    }
    edit.insert(cursorPos, separator)
    insertDateTime(edit, cursorPos);
}

export function updateClock(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = Utils.getActiveTextEditorEdit();
    const cursorPos = Utils.getCursorPosition();
    const line = Utils.getLine(document, cursorPos);
    
    const clockTotal = Datetime.getClockTotal(line);
    if (!clockTotal) {
        vscode.window.showErrorMessage('You need two timestamps to update the clock total.');
        return;
    }
    
    const separator = Utils.getClockTotalSeparator();
    const separatorIndex = line.indexOf(separator);
    if (separatorIndex !== -1) {
        const initPos = new vscode.Position(cursorPos.line, separatorIndex);
        const endPos = new vscode.Position(cursorPos.line, line.length);
        const range = new vscode.Range(initPos, endPos);
        edit.replace(range, '');
    }
    edit.insert(cursorPos, separator)
    edit.insert(cursorPos, clockTotal);
}

function insertDateTime(edit: vscode.TextEditorEdit, cursorPos: vscode.Position) {
    const dateTimeObject = Datetime.currentDateTime();
    const dateTimeString = Datetime.buildDateTimeString(dateTimeObject);

    edit.insert(cursorPos, dateTimeString);
}
