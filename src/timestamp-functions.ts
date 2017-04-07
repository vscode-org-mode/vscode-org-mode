import * as vscode from 'vscode';
import * as Utils from './utils';
import * as Datetime from './simple-datetime';

export function insertTimestamp(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    const document = Utils.getActiveTextEditorEdit();
    const cursorPos = Utils.getCursorPosition();
    
    const dateObject = Datetime.currentDatetime();
    const dateString = Datetime.buildDateString(dateObject);

    edit.insert(cursorPos, dateString);
}