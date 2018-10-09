'use strict';

import 'mocha';
import * as assert from 'assert';
import { Position, Selection, TextDocument, window, workspace, TextEditor } from 'vscode';
import { join } from 'path';
import * as checkboxes from '../src/checkboxes';

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
        const filePath = join(__dirname, '../../test/fixtures/checkboxes.org');
        let expected = '* TODO Implement tests [0%] [0/4]';
        let textDocument: TextDocument;
        workspace.openTextDocument(filePath).then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            const pos = new Position(9, 5);
            editor.selection = new Selection(pos, pos);
            return editor.edit(edit => {
                checkboxes.OrgUpdateSummary(editor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(9).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
    test('Ticking checkbox updates parent', done => {
        const filePath = join(__dirname, '../../test/fixtures/checkboxes.org');
        let expected = '  - [-] toggling child checkbox [25%]';
        let textDocument: TextDocument;
        workspace.openTextDocument(filePath).then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            const pos = new Position(14, 14);
            editor.selection = new Selection(pos, pos);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(12).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
    test('Ticking parent checkbox ticks all children', done => {
        const filePath = join(__dirname, '../../test/fixtures/checkboxes.org');
        const expected = [
            '    - [x] updates parent summary/percent cookie',
            '    - [x] sets parent to on if all children are on',
            '    - [x] sets parent to off when all children are off',
            '    - [x] sets parent to undetermined when some children are on and some are off'
        ];
        let textDocument: TextDocument;
        workspace.openTextDocument(filePath).then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            const pos = new Position(12, 14);
            editor.selection = new Selection(pos, pos);
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
        const filePath = join(__dirname, '../../test/fixtures/checkboxes.org');
        let expected = '  - [ ] call people [0/3]';
        let textDocument: TextDocument;
        workspace.openTextDocument(filePath).then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            const pos = new Position(3, 14);
            editor.selection = new Selection(pos, pos);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(1).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
    test('Ticking all children ticks parent checkbox', done => {
        const filePath = join(__dirname, '../../test/fixtures/checkboxes.org');
        let expected = '  - [x] toggling parent checkbox [3/3]';
        let textDocument: TextDocument;
        let textEditor: TextEditor;
        workspace.openTextDocument(filePath).then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            textEditor = editor;
            var pos = new Position(18, 5);
            editor.selection = new Selection(pos, pos);
            return editor.edit(edit => {
                checkboxes.OrgToggleCheckbox(editor, edit);
            });
        }).then(() => {
            var pos = new Position(20, 5);
            textEditor.selection = new Selection(pos, pos);
            return textEditor.edit(edit => {
                checkboxes.OrgToggleCheckbox(textEditor, edit);
            });
        }).then(() => {
            var actual = textDocument.lineAt(17).text;
            assert.equal(actual, expected);
        }).then(done, done);
    });
});
