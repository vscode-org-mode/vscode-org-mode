'use strict';

import 'mocha';
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as checkboxes from '../src/checkboxes';

const content2level: string = 
`* TODO Organize party [/]
  - [-] call people [/]
    - [ ] Peter
    - [X] Sarah
    - [ ] Sam
  - [X] order food
  - [ ] think about what music to play
  - [X] talk to the neighbors

* TODO Implement tests [%] [/]
  - [ ] updates summary cookie
  - [ ] updates percent cookie
  - [ ] toggling child checkbox [%]
    - [ ] updates parent summary/percent cookie
    - [ ] sets parent to on if all children are on
    - [ ] sets parent to off when all children are off
    - [ ] sets parent to undetermined when some children are on and some are off
  - [-] toggling parent checkbox [/]
    - [ ] updates summary/percent cookie
    - [x] sets all children to on when parent is on
    - [ ] sets all children to off when parent is off
`;

const content3level: string = 
`* TODO Organize party [/]
  - [-] order food [%]
    - [ ] appetizers
    - [-] salads [/]
      - [ ] ceasar salad
      - [x] coleslaw
      - [ ] avocado salad
    - [ ] dessert [/]
      - [ ] cake
      - [ ] cookies
      - [ ] icecream
  - [x] order drinks
`;

function closeAllEditors(): Thenable<any> {
	return vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

function moveAndSelect(editor: vscode.TextEditor, line: number, col: number, lineTo?: number, colTo?: number) {
    lineTo = lineTo ? lineTo : line;
    colTo = colTo ? colTo : col;
    editor.selection = new vscode.Selection(line, col, lineTo, colTo);
}

function loadContent(content: string): Thenable<vscode.TextDocument> {
    return vscode.workspace.openTextDocument({ language: 'org', content: content });
}

suite('Checkboxes', () => {
    teardown(closeAllEditors);
    
    test('Can convert tabs to spaces', done => {
        let cases = [
            "  \t \t ",
            "\t\t",
            "\t  \t",
            "    \t \t  "
        ];
        let expected4 = [
            9,
            8,
            8,
            14
        ];
        let expected8 = [
            17,
            16,
            16,
            18
        ];

        for (let i: number = 0; i < cases.length; i++) {
            assert.equal(checkboxes.orgTabsToSpaces(cases[i], 4), expected4[i]);
            assert.equal(checkboxes.orgTabsToSpaces(cases[i], 8), expected8[i]);
        }
        done();
    });
    test('Can update summary', async () => {
        let expected = '* TODO Implement tests [0%] [0/4]';
        let document = await loadContent(content2level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 9, 5);
        await vscode.commands.executeCommand('org.updateSummary');
        let actual = document.lineAt(9).text;
        assert.equal(actual, expected);
    });
    test('Ticking checkbox updates parent', async () => {
        let expected = '  - [-] toggling child checkbox [25%]';
        let document = await loadContent(content2level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 14, 14);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        let actual = document.lineAt(12).text;
        assert.equal(actual, expected);
    });
    test('Ticking parent checkbox ticks all children', async () => {
        const expected = [
            '    - [x] updates parent summary/percent cookie',
            '    - [x] sets parent to on if all children are on',
            '    - [x] sets parent to off when all children are off',
            '    - [x] sets parent to undetermined when some children are on and some are off'
        ];
        const lineNo = [13, 14, 15, 16];
        let document = await loadContent(content2level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 12, 14);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        for (let i: number = 0; i < expected.length; i++) {
            let actual = document.lineAt(lineNo[i]).text;
            assert.equal(actual, expected[i]);
        }
    });
    test('Unticking last ticked child clears parent checkbox', async () => {
        let expected = '  - [ ] call people [0/3]';
        let document = await loadContent(content2level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 3, 14);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        let actual = document.lineAt(1).text;
        assert.equal(actual, expected);
    });
    test('Ticking all children ticks parent checkbox', async () => {
        let expected = '  - [x] toggling parent checkbox [3/3]';
        let document = await loadContent(content2level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 18, 5);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        moveAndSelect(editor, 20, 5);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        let actual = document.lineAt(17).text;
        assert.equal(actual, expected);
    });
    test('Ticking parent checkbox ticks all children (3 level)', async () => {
        const expected = [
            '    - [x] salads [3/3]',
            '      - [x] cookies'
        ];
        const lineNo = [3, 9];
        let document = await loadContent(content3level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 1, 7);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        for (let i: number = 0; i < expected.length; i++) {
            let actual = document.lineAt(lineNo[i]).text;
            assert.equal(actual, expected[i]);
        }
    });
    test('Unticking child checkbox makes parent untetermined (3 level)', async () => {
        const expected = '    - [-] dessert [2/3]';
        let document = await loadContent(content3level);
        let editor = await vscode.window.showTextDocument(document);
        moveAndSelect(editor, 1, 7);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        moveAndSelect(editor, 8, 7);
        await vscode.commands.executeCommand('org.toggleCheckbox');
        let actual = document.lineAt(7).text;
        assert.equal(actual, expected);
    });
});
