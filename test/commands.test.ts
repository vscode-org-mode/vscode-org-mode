import * as vscode from 'vscode';
import * as assert from 'assert';

interface TestEditorOptions {
    language?: string;
    content?: string;
}

type TestEditorAction = (editor: vscode.TextEditor, document: vscode.TextDocument) => void;

async function inTextEditor(options: TestEditorOptions, action: TestEditorAction) {
    const d = await vscode.workspace.openTextDocument(options);
    await vscode.window.showTextDocument(d);
    await action(vscode.window.activeTextEditor!, d);
}

function move(editor: vscode.TextEditor, line: number, col: number) {
    const pos = new vscode.Position(line, col);
    editor.selection = new vscode.Selection(pos, pos);
}

suite('Commands', () => {

    test('Demote', async () => {
        const steps = [
            '* Home',
            '** Home',
            '*** Home',
            '**** Home',
            '***** Home',
        ];

        await inTextEditor({language: 'org', content: steps[0]}, async (e, d) => {
            for (let i = 1; i < steps.length; ++i) {
                await vscode.commands.executeCommand('org.doDemote');
                assert.equal(d.getText(), steps[i]);
            }
        });
    });

    test('Promote', async () => {
        const steps = [
            '***** Home',
            '**** Home',
            '*** Home',
            '** Home',
            '* Home',
        ];

        await inTextEditor({language: 'org', content: steps[0]}, async (e, d) => {
            for (let i = 1; i < steps.length; ++i) {
                await vscode.commands.executeCommand('org.doPromote');
                assert.equal(d.getText(), steps[i]);
            }
        });
    });
});
