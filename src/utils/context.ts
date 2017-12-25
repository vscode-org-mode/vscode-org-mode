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
    private document: TextDocument;
    public cursorPos: Position;
    public curLine: string;
    public prefix: string;
    public isHeader: boolean;

    constructor(document: TextDocument, cursorPos: Position) {
        this.cursorPos = cursorPos;
        this.curLine = document.lineAt(this.cursorPos).text;
        this.document = document;
        this.prefix = this.getPrefix(this.curLine);
        this.isHeader = this.prefix.startsWith("*");
    }

    public findBeginningOfSection() {
        let curLine = this.cursorPos.line;
        let curPos;
        let curLinePrefix;
    
        do {
            curLine--;
            curPos = new Position(curLine, 0);
            curLinePrefix = this.getPrefix(this.document.lineAt(curPos).text);
        } while(curLine > 0 && this.inSubsection(curLinePrefix))
    
        if(curPos) {
            curPos = new Position(curPos.line + 1, 0);
        }
    
        return curPos;
    }

    public findEndOfSection() {
        if(this.cursorPos.line === this.document.lineCount - 1) {
            return new Position(this.cursorPos.line, this.curLine.length);
        }
    
        let curLine = this.cursorPos.line;
        let curPos;
        let curLinePrefix;
    
        do {
            curLine++;
            curPos = new Position(curLine, 0);
            curLinePrefix = this.getPrefix(this.document.lineAt(curPos).text);
        } while(curLine < this.document.lineCount - 1 && this.inSubsection(curLinePrefix))

        curPos = new Position(curPos.line - 1, this.getLine(new Position(curPos.line - 1, 0)).length + 1);
    
        return curPos;
    }

    private inSubsection(linePrefix: string) {
        return this.prefix === linePrefix || linePrefix === "-" || !linePrefix || linePrefix.match(/\d+\./);
    }

    private getLine(pos: Position) {
        return this.document.lineAt(pos).text;
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