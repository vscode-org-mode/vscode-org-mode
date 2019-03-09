'use strict';

import { window, workspace, TextLine, Range, TextEditor, TextEditorEdit } from 'vscode';

// Checkbox is represented by exactly one symbol between square brackets.  Symbol indicates status: '-' undetermined, 'x' or 'X' checked, ' ' unchecked.
const checkboxRegex = /\[([-xX ])\]/;
// Summary is a cookie indicating the number of ticked checkboxes in the child list relative to the total number of checkboxes in the list. 
const summaryRegex = /\[(\d*\/\d*)\]/;
// Percentage is a cookie indicating the percentage of ticked checkboxes in the child list relative to the total number of checkboxes in the list. 
const percentRegex = /\[(\d*)%\]/;
const indentRegex = /^(\s*)\S/;
let orgTabSize: number = 4;
    
export function orgTabsToSpaces(tabs: string, tabSize: number = 4): number {
    if (!tabs) {
        return 0;
    }
    let off = 1;
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i] == '\t') {
            off += tabSize - off % tabSize;
        } else {
            off++;
        }
    }
    return off;
}

export function orgToggleCheckbox(editor: TextEditor, edit: TextEditorEdit) {
    let doc = editor.document;
    let line = doc.lineAt(editor.selection.active.line);
    let checkbox = orgFindCookie(checkboxRegex, line);
    if (checkbox) {
        orgTabSize = workspace.getConfiguration('editor', doc.uri).get('tabSize');
        let text = doc.getText(checkbox).toLowerCase();
        let delta = orgCascadeCheckbox(edit, checkbox, line, text == 'x' ? ' ' : 'x');
        let parent = orgFindParent(editor, line);
        // Since the updates as a result of toggle have not happened yet in the editor, 
        // counting checked children is going to use old value of the current checkbox.  
        // Hence the delta adjustment.
        if (parent) {
            orgUpdateParent(editor, edit, parent, delta);
        }
    }
}

export function orgUpdateSummary(editor: TextEditor, edit: TextEditorEdit) {
    let doc = editor.document;
    let line = doc.lineAt(editor.selection.active.line);
    orgTabSize = workspace.getConfiguration('editor', doc.uri).get('tabSize');
    orgUpdateParent(editor, edit, line, 0);
}

// Pattern elements, like ratio summary, percent summary, checkbox, of the orgmode document are called cookies.
function orgFindCookie(cookie: RegExp, line: TextLine): Range | undefined {
    let match = cookie.exec(line.text);
    if (match) {
        return new Range(line.lineNumber, match.index + 1, line.lineNumber, match.index + 1 + match[1].length);
    }
    return undefined;
}

function orgTriStateToDelta(value: string): number {
    switch (value) {
        case 'x': return 1;
        case ' ': return -1;
        default:  return 0;
    }
}

function orgGetTriState(checked, total: number): string {
    return checked == 0 ? ' ' : (checked == total ? 'x' : '-');
}

// Calculate and return indentation level of the line.  Used in traversing nested lists and locating parent item.
function orgGetIndent(line: TextLine): number {
    let match = indentRegex.exec(line.text);
    if (match) {
        return orgTabsToSpaces(match[1], orgTabSize);
    }
    return 0;
}

// Set checkbox to the desired state and perform necessary updates to child and parent elements (however many levels).
function orgCascadeCheckbox(edit: TextEditorEdit, checkbox: Range, line: TextLine, state: string): number {
    if (!checkbox) {
        return 0;
    }
    let editor = window.activeTextEditor;
    let text = editor.document.getText(checkbox).toLowerCase();
    if (text == state) {
        return 0;  // Nothing to do.
    }
    edit.replace(checkbox, state);
    if (!line) {
        return orgTriStateToDelta(state);
    }
    let children = orgFindChildren(editor, line);
    let child: TextLine = undefined;
    for (child of children) {
        orgCascadeCheckbox(edit, orgFindCookie(checkboxRegex, child), child, state);
    }
    // If there is a summary cookie on this line, update it to either [0/0] or [total/total] depending on target state.
    let total = state ? children.length : 0;
    let summary = orgFindCookie(summaryRegex, line);
    if (summary) {
        edit.replace(summary, total.toString() + '/' + total.toString());
    }
    // If there is a percent cookie on this line, update it to either [0%] or [100%] depending on target state.
    let percent = orgFindCookie(percentRegex, line);
    if (percent) {
        total = state == 'x' ? 100 : 0;
        edit.replace(percent, total.toString());
    }
    return orgTriStateToDelta(state);
}

// Find parent item by walking lines up to the start of the file looking for a smaller indentation.  
// Does not ignore blank lines (indentation 0).
function orgFindParent(editor: TextEditor, line: TextLine): TextLine | undefined {
    let doc = editor.document;
    let lnum = line.lineNumber;
    let indent = orgGetIndent(line);
    let parent = undefined;
    let pindent = indent;
    while (pindent >= indent) {
        lnum--;
        if (lnum < 0) {
            return undefined;
        }
        
        parent = doc.lineAt(lnum);
        pindent = orgGetIndent(parent);
    }
    return parent;
}

// Update checkbox and summary on this line.  Adjust checked items count with an additional offset.  
// That accounts for a checkbox that has just been toggled but text in the editor has not been updated yet.
function orgUpdateParent(editor: TextEditor, edit: TextEditorEdit, line: TextLine, adjust: number) {
    if (!line) {
        return;
    }
    let children = orgFindChildren(editor, line);
    let total = children.length;
    let checked = adjust;
    let chk: Range = undefined;
    let doc = editor.document;
    for (let child of children) {
        chk = orgFindCookie(checkboxRegex, child);
        if (doc.getText(chk).toLowerCase() == 'x') {
            checked++;
        }
    }
    let summary = orgFindCookie(summaryRegex, line);
    if (summary) {
        edit.replace(summary, checked.toString() + '/' + total.toString());
    }
    let percent = orgFindCookie(percentRegex, line);
    if (percent) {
        edit.replace(percent, total == 0 ? '0' : (checked * 100 / total).toString());
    }
    // If there is a checkbox on this line, update it depending on (checked == total).
    chk = orgFindCookie(checkboxRegex, line);
    // Prevent propagation downstream by passing line = undefined.
    let delta = orgCascadeCheckbox(edit, chk, undefined, orgGetTriState(checked, total));
    // Recursively update parent nodes
    let parent = orgFindParent(editor, line);
    // Since the updates as a result of toggle have not happened yet in the editor, 
    // counting checked children is going to use old value of the current checkbox.  
    // Hence the delta adjustment.
    if (parent) {
        orgUpdateParent(editor, edit, parent, delta);
    }
}

// Find parent item by walking lines up to the start of the file looking for a smaller indentation.  
// Does not ignore blank lines (indentation 0).
function orgFindChildren(editor: TextEditor, line: TextLine): TextLine[] {
    let children: TextLine[] = [];
    let lnum = line.lineNumber;
    let doc = editor.document;
    let lmax = doc.lineCount - 1; 
    let indent = orgGetIndent(line);
    let child: TextLine = undefined;
    let cindent = indent;
    let next_indent = -1;
    while (lnum < lmax) {
        lnum++;
        child = doc.lineAt(lnum);
        cindent = orgGetIndent(child);
        if (cindent <= indent) {
            break;
        }
        if (next_indent < 0) {
            next_indent = cindent;
        }
        if (cindent <= next_indent) {
            children.push(child);
        }
    }
    return children;
}
