'use strict';
import * as vscode from 'vscode';
import * as HeaderFunctions from './header-functions';
import * as TimestampFunctions from './timestamp-functions';
import * as MarkupFunctions from './markup-functions';
import * as SubtreeFunctions from './subtree-functions';
import * as OrgExportFunctions from './org-export-functions';
import {
    incrementContext,
    decrementContext
} from './modify-context';
import * as PascuaneseFunctions from './pascuanese-functions';
import { OrgFoldingProvider } from './org-folding-provider';

export function activate(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel("Org");

    let insertHeadingRespectContentCmd = vscode.commands.registerTextEditorCommand('org.insertHeadingRespectContent', HeaderFunctions.insertHeadingRespectContent);
    let insertChildCmd = vscode.commands.registerTextEditorCommand('org.insertSubheading', HeaderFunctions.insertChild);
    let demoteLineCmd = vscode.commands.registerTextEditorCommand('org.doDemote', HeaderFunctions.demoteLine);
    let promoteLineCmd = vscode.commands.registerTextEditorCommand('org.doPromote', HeaderFunctions.promoteLine);
    let promoteSubtreeCmd = vscode.commands.registerTextEditorCommand('org.promoteSubtree', SubtreeFunctions.promoteSubtree);
    let demoteSubtreeCmd = vscode.commands.registerTextEditorCommand('org.demoteSubtree', SubtreeFunctions.demoteSubtree);

    let insertTimestampCmd = vscode.commands.registerTextEditorCommand('org.timestamp', TimestampFunctions.insertTimestamp);
    let clockInCmd = vscode.commands.registerTextEditorCommand('org.clockin', TimestampFunctions.clockIn);
    let clockOutCmd = vscode.commands.registerTextEditorCommand('org.clockout', TimestampFunctions.clockOut);
    let updateClockCmd = vscode.commands.registerTextEditorCommand('org.updateclock', TimestampFunctions.updateClock);

    let incrementContextCmd = vscode.commands.registerTextEditorCommand('org.incrementContext', incrementContext);

    let decrementContextCmd = vscode.commands.registerTextEditorCommand('org.decrementContext', decrementContext);

    const boldCmd = vscode.commands.registerTextEditorCommand('org.bold', MarkupFunctions.bold);
    const italicCmd = vscode.commands.registerTextEditorCommand('org.italic', MarkupFunctions.italic);
    const underlineCmd = vscode.commands.registerTextEditorCommand('org.underline', MarkupFunctions.underline);
    const codeCmd = vscode.commands.registerTextEditorCommand('org.code', MarkupFunctions.code);
    const verboseCmd = vscode.commands.registerTextEditorCommand('org.verbose', MarkupFunctions.verbose);
    const literalCmd = vscode.commands.registerTextEditorCommand('org.literal', MarkupFunctions.literal);
    const butterflyCmd = vscode.commands.registerTextEditorCommand('org.butterfly', PascuaneseFunctions.butterfly);

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
    
    context.subscriptions.push(insertHeadingRespectContentCmd);
    context.subscriptions.push(insertChildCmd);

    context.subscriptions.push(demoteLineCmd);
    context.subscriptions.push(promoteLineCmd);

    context.subscriptions.push(promoteSubtreeCmd);
    context.subscriptions.push(demoteSubtreeCmd);

    context.subscriptions.push(insertTimestampCmd);
    context.subscriptions.push(incrementContextCmd);
    context.subscriptions.push(decrementContextCmd);

    context.subscriptions.push(boldCmd);
    context.subscriptions.push(italicCmd);
    context.subscriptions.push(underlineCmd);
    context.subscriptions.push(codeCmd);
    context.subscriptions.push(verboseCmd);
    context.subscriptions.push(literalCmd);
    context.subscriptions.push(butterflyCmd);

    context.subscriptions.push(orgToAscii);
    context.subscriptions.push(orgToBeamerLatex);
    context.subscriptions.push(orgToBeamerPdf);
    context.subscriptions.push(orgToHtml);
    context.subscriptions.push(orgToIcs);
    context.subscriptions.push(orgToLatex);
    context.subscriptions.push(orgToPdf);
    context.subscriptions.push(orgToMarkdown);
    context.subscriptions.push(orgToOdt);

    vscode.languages.registerFoldingRangeProvider('org', new OrgFoldingProvider());
}

export function deactivate() {
}
