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

function select(editor: vscode.TextEditor, range: vscode.Range) {
    editor.selection = new vscode.Selection(range.start, range.end);
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

        await inTextEditor({ language: 'org', content: steps[0] }, async (e, d) => {
            for (let i = 1; i < steps.length; ++i) {
                await vscode.commands.executeCommand('org.doDemote');
                assert.equal(d.getText(), steps[i]);
            }
        });
    }).timeout(10000); // First test could be slow because of VSCode init

    test('Promote', async () => {
        const steps = [
            '***** Home',
            '**** Home',
            '*** Home',
            '** Home',
            '* Home',
        ];

        await inTextEditor({ language: 'org', content: steps[0] }, async (e, d) => {
            for (let i = 1; i < steps.length; ++i) {
                await vscode.commands.executeCommand('org.doPromote');
                assert.equal(d.getText(), steps[i]);
            }
        });
    });

    test('Bold', async () => {
        const initial = 'Some text here';
        const expected = 'Some *text* here';
        const textWordRange = new vscode.Range(0, 5, 0, 9);

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            select(e, textWordRange);
            await vscode.commands.executeCommand('org.bold');
            assert.equal(d.getText(), expected);
        });
    });

    test('Italic', async () => {
        const initial = 'Some text here';
        const expected = 'Some /text/ here';
        const textWordRange = new vscode.Range(0, 5, 0, 9);

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            select(e, textWordRange);
            await vscode.commands.executeCommand('org.italic');
            assert.equal(d.getText(), expected);
        });
    });

    test('Underline', async () => {
        const initial = 'Some text here';
        const expected = 'Some _text_ here';
        const textWordRange = new vscode.Range(0, 5, 0, 9);

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            select(e, textWordRange);
            await vscode.commands.executeCommand('org.underline');
            assert.equal(d.getText(), expected);
        });
    });

    test('Code', async () => {
        const initial = 'Some text here';
        const expected = 'Some ~text~ here';
        const textWordRange = new vscode.Range(0, 5, 0, 9);

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            select(e, textWordRange);
            await vscode.commands.executeCommand('org.code');
            assert.equal(d.getText(), expected);
        });
    });

    test('Verbose', async () => {
        const initial = 'Some text here';
        const expected = 'Some =text= here';
        const textWordRange = new vscode.Range(0, 5, 0, 9);

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            select(e, textWordRange);
            await vscode.commands.executeCommand('org.verbose');
            assert.equal(d.getText(), expected);
        });
    });

    test('Literal', async () => {
        const initial = 'Some text here';
        const expected = ': Some text here';

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            await vscode.commands.executeCommand('org.literal');
            assert.equal(d.getText(), expected);
        });
    });

    test('InsertSubheading', async () => {
        const initial = `* Header
* Header2`;
        const expected = `* Header\n` +
            `** \n` +
            `*** \n` +
            `* Header2`;

        await inTextEditor({ language: 'org', content: initial }, async (e, d) => {
            await vscode.commands.executeCommand('org.insertSubheading');
            await vscode.commands.executeCommand('org.insertSubheading');
            assert.equal(d.getText(), expected);
        });
    });
});
