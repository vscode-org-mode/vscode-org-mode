'use strict';

import 'mocha';
import * as assert from 'assert';
import { Position, Selection, TextDocument, window, workspace } from 'vscode';
import { join } from 'path';
import * as checkboxes from '../src/checkboxes';

suite('checkboxes', () => {
    test('Can update summary', () => {
        const filePath = join(__dirname, '../../test/fixtures/checkboxes.org');
        let textDocument: TextDocument;
        workspace.openTextDocument(filePath).then(document => {
            textDocument = document;
            return window.showTextDocument(document);
        }).then(editor => {
            const pos = new Position(10, 5);
            editor.selection = new Selection(pos, pos);
            return editor.edit(edit => {
                checkboxes.OrgUpdateSummary(editor, edit);
            });
        }).then(() => {
            var line = textDocument.lineAt(10).text;
            assert.equal(line, '* TODO Implement tests [0%] [0/4]');
        });
    });
});
