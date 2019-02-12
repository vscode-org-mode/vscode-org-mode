'use strict';
import * as vscode from 'vscode';
import * as util from 'util';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const execSync = child_process.execSync;

const userTemplateFilename = getUserTemplateFilename();
let extensionTemplateFilename;

export function pandocExportAsPdf(context: vscode.ExtensionContext) {
    function getPandocCommand() {
        // TODO: make setting for this
        const pandocVariables = [
            'colorlinks',
            'linestretch=1.2',
            'fontsize=12pt',
            'geometry:left=3cm',
            'geometry:right=3cm',
            'geometry:top=2cm',
            'geometry:bottom=3cm'
        ];
        const pandocArgs = ['--toc'];

        const pandocStr = pandocVariables.length > 1 ? ' -V ' + pandocVariables.join(' -V ') : '';

        let templateFilename;
        if (fs.existsSync(userTemplateFilename)) {
            templateFilename = userTemplateFilename;
        } else {
            extensionTemplateFilename = context.asAbsolutePath('./pandocTemplate.latex');
            templateFilename = extensionTemplateFilename;
        }
        const pandocCommand = `pandoc ${pandocArgs.join(
            ' '
        )} --template="${templateFilename}" ${pandocStr} "${documentBaseName}.org" -o "${tempDir + documentName}.tex"`;

        console.log(pandocCommand);
        return pandocCommand;
    }
    function modifyTexFile() {
        let data = fs.readFileSync(`${tempDir + documentName}.tex`).toString();

        data = data.replace(/(TODO|DONE|WAIT|PRGS)/g, '\\statusBadge{$1}');
        data = data.replace(/definecolor{color\\statusBadge{(TODO|PRGS|WAIT|DONE)}}/g, 'definecolor{color$1}');
        data = data.replace(/{\[}(\d\d\d\d-\d?\d-\d?\d\\?\s+\w\w\w){\]}/g, '\\timeStamp{$1}');
        // data = data.replace(/\\section{/g, '\\clearpage\\section{');

        fs.writeFileSync(`${tempDir + documentName}.tex`, data, 'utf8');
        return;
    }

    const documentPath = vscode.window.activeTextEditor.document.uri.fsPath;
    if (!documentPath.match(/\.org$/)) {
        vscode.window.showErrorMessage('Cannot pandoc export from non Org-Mode documents');
        throw TypeError('Wrong document type active');
    }
    const documentBaseName = documentPath.replace(/\.org$/, '');
    const documentDir = documentBaseName.replace(/\/[^\/]+$/, '');
    const documentName = documentBaseName.replace(/^.*\//, '');
    const tempDir = documentDir + '/' + `_temp${+new Date() % 1000000}` + '/';

    fs.mkdirSync(tempDir);

    execSync(getPandocCommand());

    modifyTexFile();

    execSync(`latexmk -cd -pdf -interaction=nonstopmode "${tempDir + documentName}.tex"`);

    execSync(`latexmk "${tempDir + documentName}.tex" -cd -c`);

    fs.renameSync(`${tempDir + documentName}.pdf`, `${documentBaseName}.pdf`);

    vscode.window.showInformationMessage('PDF Created');

    fs.unlinkSync(`${tempDir + documentName}.tex`);
    fs.rmdirSync(tempDir);
}

export function editPandocTemplate(context: vscode.ExtensionContext) {
    extensionTemplateFilename = context.asAbsolutePath('./pandocTemplate.latex');

    if (!fs.existsSync(userTemplateFilename)) {
        fs.writeFileSync(userTemplateFilename, fs.readFileSync(extensionTemplateFilename), 'utf8');
    }

    vscode.workspace.openTextDocument(vscode.Uri.file(userTemplateFilename)).then(doc => vscode.window.showTextDocument(doc));
}

// Modified from https://github.com/bartosz-antosik/vscode-spellright/blob/master/src/spellright.js
function getUserTemplateFilename() {
    let codeFolder = 'Code';
    const templateName = 'orgModePandocTemplate.latex';
    if (vscode.version.indexOf('insider') >= 0) {
        codeFolder = 'Code - Insiders';
    }
    if (process.platform == 'win32') {
        return path.join(process.env.APPDATA, codeFolder, 'User', templateName);
    } else if (process.platform == 'darwin') {
        return path.join(process.env.HOME, 'Library', 'Application Support', codeFolder, 'User', templateName);
    } else if (process.platform == 'linux') {
        return path.join(process.env.HOME, '.config', codeFolder, 'User', templateName);
    } else {
        return '';
    }
}
