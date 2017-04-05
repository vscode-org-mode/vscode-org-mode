import * as vscode from 'vscode';
import getCursorContext from './cursor-context';
import * as Datetime from './simple-datetime';

export const UP = "UP";
export const DOWN = "DOWN";

// If any new contexts are created (Such as TODO), switch for the dataLabel here
function modifyContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, action: string) {
    const ctx = getCursorContext(textEditor, edit);
    if (ctx) {
        const newDateString = Datetime.modifyDate(ctx.data, action);
        edit.replace(ctx.range, newDateString);
    } else {
        vscode.window.showErrorMessage("No context to modify");
    }
}

export function incrementContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    modifyContext(textEditor, edit, UP);
}

export function decrementContext(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    modifyContext(textEditor, edit, DOWN);
}