import * as vscode from 'vscode';
import * as util from 'util';
import cp = require('child_process');

const cmdPattern =  'emacs -Q --batch' +
' --eval "(require \'org)"' +
' --visit="%s"'+
' --funcall %s;';


export async function toAscii(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-ascii-export-to-ascii');
}

export async function toBeamerLatex(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-beamer-export-to-latex');
}

export async function toBeamerPdf(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-beamer-export-to-pdf');
}

export async function toHtml(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-html-export-to-html');
}

export async function toIcs(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-icalendar-export-to-ics');
}

export async function toLatex(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-latex-export-to-latex');
}

export async function toPdf(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-latex-export-to-pdf');
}

export async function toMarkdown(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-md-export-to-markdown');
}

export async function toOdt(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel) {
    execEmacsCommand(textEditor, outputChannel, 'org-odt-export-to-odt ');
}

function execEmacsCommand(textEditor: vscode.TextEditor, outputChannel: vscode.OutputChannel, exportFunction: String) : void {
    if(!textEditor || !textEditor.document || !textEditor.document.fileName) {
        return;
    }
    let config = vscode.workspace.getConfiguration("org.export");
    let filename = textEditor.document.fileName;
    textEditor.document.save().then(() => {
        if(config.get<boolean>("showOutputChannel")) {
            outputChannel.show(true);
        }
        let cmd = util.format(cmdPattern, filename, exportFunction);

        outputChannel.appendLine("[Running] " + cmd);
        let process = cp.exec(cmd);
        process.stdout.on("data", (data) => {
            outputChannel.append(data.toString());
        });
        process.stderr.on("data", (data) => {
            outputChannel.append(data.toString());
        });
        process.on("close", (code) => {
            outputChannel.appendLine("[Done] Command " + exportFunction + " terminated with return code: " + code); 
        });
    });
};

