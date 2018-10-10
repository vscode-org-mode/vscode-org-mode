'use strict';

import 'mocha';
import * as assert from 'assert';
import { Selection, TextDocument, window, workspace, TextEditor } from 'vscode';
import * as checkboxes from '../src/checkboxes';

const content: string = 
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

function moveAndSelect(editor: TextEditor, line: number, col: number, lineTo?: number, colTo?: number) {
    lineTo = lineTo ? lineTo : line;
    colTo = colTo ? colTo : col;
    editor.selection = new Selection(line, col, lineTo, colTo);
}

function loadContent(): Thenable<TextDocument> {
    return workspace.openTextDocument({ language: 'org', content: content });
}

suite('Checkboxes', () => {
    test('Can convert tabs to spaces', done => {
        let cases = [
            "  \t \t ",
            "\t\t",
            "\t  \t",
            "    \t \t  "
        ];
        let expected = [
            9,
            8,
            8,
            14
        ];

        for (let i = 0; i < cases.length; i++) {
            assert.equal(checkboxes.OrgTabsToSpaces(cases[i]), expected[i]);
        }
        done();
    });
    test('Can update summary', done => {
        let expected = '* TODO Implement tests [0%] [0/4]';
        let textDocument: TextDocument;
        loadContent().then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            moveAndSelect(editor, 9, 5);
            return editor.edit(edit => {
                checkboxes.OrgUpdateSummary(editor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(9).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
    test('Ticking checkbox updates parent', done => {
        let expected = '  - [-] toggling child checkbox [25%]';
        let textDocument: TextDocument;
        loadContent().then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            moveAndSelect(editor, 14, 14);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(12).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
    test('Ticking parent checkbox ticks all children', done => {
        const expected = [
            '    - [x] updates parent summary/percent cookie',
            '    - [x] sets parent to on if all children are on',
            '    - [x] sets parent to off when all children are off',
            '    - [x] sets parent to undetermined when some children are on and some are off'
        ];
        let textDocument: TextDocument;
        loadContent().then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            moveAndSelect(editor, 12, 14);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            for (var i: number = 0; i < 4; i++) {
                var actual = textDocument.lineAt(13 + i).text;
                assert.equal(actual, expected[i]);
            }
        }).then(done, done);
    });
    test('Unticking last ticked child clears parent checkbox', done => {
        let expected = '  - [ ] call people [0/3]';
        let textDocument: TextDocument;
        loadContent().then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            moveAndSelect(editor, 3, 14);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(1).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
    test('Ticking all children ticks parent checkbox', done => {
        let expected = '  - [x] toggling parent checkbox [3/3]';
        let textDocument: TextDocument;
        let textEditor: TextEditor;
        loadContent().then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            textEditor = editor;
            moveAndSelect(editor, 18, 5);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            moveAndSelect(textEditor, 20, 5);
            return textEditor.edit(edit => {
                checkboxes.OrgToggleCheckbox(textEditor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(17).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
});
