'use strict';

import 'mocha';
import * as assert from 'assert';
import { Position, Selection, TextDocument, window, workspace } from 'vscode';
import { join } from 'path';
import * as checkboxes from '../src/checkboxes';

suite('Checkboxes', () => {
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
});
