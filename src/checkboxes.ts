'use strict';

import { window, TextLine, Range, TextEditor, TextEditorEdit } from 'vscode';

// Checkbox is represented by exactly one symbol between square brackets.  Symbol indicates status: '-' undetermined, 'x' or 'X' checked, ' ' unchecked.
const checkboxRegex = /\[([-xX ])\]/;
// Summary is a cookie indicating the number of ticked checkboxes in the child list relative to the total number of checkboxes in the list. 
const summaryRegex = /\[(\d*\/\d*)\]/;
// Percentage is a cookie indicating the percentage of ticked checkboxes in the child list relative to the total number of checkboxes in the list. 
const percentRegex = /\[(\d*)%\]/;
const indentRegex = /^(\s*)\S/;

export function OrgToggleCheckbox(editor: TextEditor, edit: TextEditorEdit) {
    let doc = editor.document;
    let line = doc.lineAt(editor.selection.active.line);
    let checkbox = orgFindCookie(checkboxRegex, line);
    if (checkbox) {
        let text = doc.getText(checkbox).toLowerCase();
        var delta = orgCascadeCheckbox(edit, checkbox, line, text == 'x' ? ' ' : 'x');
        let parent = orgFindParent(editor, line);
        // Since the updates as a result of toggle have not happened yet in the editor, counting checked children is going to use old value of current checkbox.  Hence the adjustment.
        if (parent) {
            orgUpdateParent(editor, edit, parent, delta);
        }
    }
}

export function OrgUpdateSummary(editor: TextEditor, edit: TextEditorEdit) {
    let doc = editor.document;
    let line = doc.lineAt(editor.selection.active.line);
    orgUpdateParent(editor, edit, line, 0);
}

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
    
export function OrgTabsToSpaces(tabs: string): number {
    if (!tabs)
        return 0;
    const tabWidth = 4;
    let off = 1;
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i] == '\t')
            off += tabWidth - off % tabWidth;
        else
            off++;
    }
    return off;
}

// Calculate and return indentation level of the line.  Used in traversing nested lists and locating parent item.
function orgGetIndent(line: TextLine): number {
    let match = indentRegex.exec(line.text);
    if (match) {
        return OrgTabsToSpaces(match[1]);
    }
    return 0;
}

// Perform the toggle.  'x' or 'X' becomes blank and blank becomes 'X'.
function orgCascadeCheckbox(edit: TextEditorEdit, checkbox: Range, line: TextLine, toCheck: string): number {
    if (!checkbox) {
        return 0;
    }
    let editor = window.activeTextEditor;
    let text = editor.document.getText(checkbox).toLowerCase();
    if (text == toCheck) {
        return 0;  // Nothing to do.
    }
    edit.replace(checkbox, toCheck);
    if (!line) {
        return orgTriStateToDelta(toCheck);
    }
    let children = orgFindChildren(editor, line);
    let child: TextLine = undefined;
    for (child of children) {
        orgCascadeCheckbox(edit, orgFindCookie(checkboxRegex, child), child, toCheck);
    }
    // If there is a summary on this line, update it to either [0/0] or [total/total] depending on value of 'check'.
    let total = toCheck ? children.length : 0;
    let summary = orgFindCookie(summaryRegex, line);
    if (summary) {
        edit.replace(summary, total.toString() + '/' + total.toString());
    }
    let percent = orgFindCookie(percentRegex, line);
    if (percent) {
        total = toCheck == 'x' ? 100 : 0;
        edit.replace(percent, total.toString());
    }
    return orgTriStateToDelta(toCheck);
}

// Find parent item by walking lines up to the start of the file looking for a smaller indentation.  Does not ignore blank lines (indentation 0).
function orgFindParent(editor: TextEditor, line: TextLine): TextLine | undefined {
    let doc = editor.document;
    let lnum = line.lineNumber;
    let indent = orgGetIndent(line);
    let parent = null;
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

// Update checkbox and summary on this line.  Adjust checked items count with an additional offset.  That accounts for 
// a checkbox that has just been toggled but text in the editor has not been updated yet.
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
    // Prevent propagation downstream by passing line = null.
    let delta = orgCascadeCheckbox(edit, chk, undefined, orgGetTriState(checked, total));
    // Recursively update parent nodes
    let parent = orgFindParent(editor, line);
    // Since the updates as a result of toggle have not happened yet in the editor, counting checked children is going to use old value of current checkbox.  Hence the adjustment.
    if (parent) {
        orgUpdateParent(editor, edit, parent, delta);
    }
}

// Find parent item by walking lines up to the start of the file looking for a smaller indentation.  Does not ignore blank lines (indentation 0).
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
