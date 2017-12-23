import * as vscode from 'vscode';
import { surroundWithText, prependTextToLine } from './utils/general_utils';

export function bold(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    surroundWithText(textEditor, edit, "*", "Please select the text you want to mark as bold.")
}

export function italic(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    surroundWithText(textEditor, edit, "/", "Please select the text you want to italicize.")
}

export function underline(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    surroundWithText(textEditor, edit, "_", "Please select the text you want to underline.")
}

export function code(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    surroundWithText(textEditor, edit, "~", "Please select the text you want to mark as code.")
}

export function verbose(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    surroundWithText(textEditor, edit, "=", "Please select the text you want to mark as verbose.")
}

export function literal(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    prependTextToLine(textEditor, edit, ": ")
}