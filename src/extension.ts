'use strict';
import * as vscode from 'vscode';
import * as OrgExportFunctions from './org-export-functions';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("Org");

    // export command
    const orgToAscii = vscode.commands.registerTextEditorCommand("org.asciiExportToAscii", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toAscii(textEditor, outputChannel);
    });
    const orgToBeamerLatex = vscode.commands.registerTextEditorCommand("org.beamerExportToLatex", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toBeamerLatex(textEditor, outputChannel);
    });
    const orgToBeamerPdf = vscode.commands.registerTextEditorCommand("org.beamerExportToPdf", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toBeamerPdf(textEditor, outputChannel);
    });
    const orgToHtml = vscode.commands.registerTextEditorCommand("org.htmlExportToHtml", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toHtml(textEditor, outputChannel);
    });
    const orgToIcs = vscode.commands.registerTextEditorCommand("org.icalendarExportToIcs", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toIcs(textEditor, outputChannel);
    });
    const orgToLatex = vscode.commands.registerTextEditorCommand("org.latexExportToLatex", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toLatex(textEditor, outputChannel);
    });
    const orgToPdf = vscode.commands.registerTextEditorCommand("org.latexExportToPdf", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toPdf(textEditor, outputChannel);
    });
    const orgToMarkdown = vscode.commands.registerTextEditorCommand("org.mdExportToMarkdown", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toMarkdown(textEditor, outputChannel);
    });
    const orgToOdt = vscode.commands.registerTextEditorCommand("org.odtExportToOdt", (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
        OrgExportFunctions.toOdt(textEditor, outputChannel);
    });

    context.subscriptions.push(outputChannel);

    context.subscriptions.push(orgToAscii);
    context.subscriptions.push(orgToBeamerLatex);
    context.subscriptions.push(orgToBeamerPdf);
    context.subscriptions.push(orgToHtml);
    context.subscriptions.push(orgToIcs);
    context.subscriptions.push(orgToLatex);
    context.subscriptions.push(orgToPdf);
    context.subscriptions.push(orgToMarkdown);
    context.subscriptions.push(orgToOdt);

}

export function deactivate() {
}
