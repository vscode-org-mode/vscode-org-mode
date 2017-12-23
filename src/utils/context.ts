import {
    Position, 
    Selection, 
    TextDocument, 
    TextEditor, 
    TextEditorEdit, 
    window, 
    workspace
} from 'vscode';

class CursorContext {
    public cursorPos: Position;
    public curLine: string;
    public prefix: string;
    public isHeader: boolean;

    constructor(document: TextDocument, cursorPos: Position) {
        this.cursorPos = cursorPos;
        this.curLine = document.lineAt(this.cursorPos).text;;
        this.prefix = this.getPrefix(this.curLine);
        this.isHeader = this.prefix.startsWith("*");
    }

    private getPrefix(line: string) {
        const prefix = line.match(/^\*+|^-\s|^\d+\./);
        if(prefix) {
            return prefix[0].trim();
        }
        else {
            return "";
        }
    }
}