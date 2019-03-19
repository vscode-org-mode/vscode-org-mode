'use strict';
import * as vscode from 'vscode';
import * as util from 'util';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const exec = util.promisify(child_process.exec);
const mkdir = util.promisify(fs.mkdir);
const rename = util.promisify(fs.rename);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const userTemplateFilename = getUserTemplateFilename();
let extensionTemplateFilename;

function getPandocCommand(context: vscode.ExtensionContext, documentBaseName: string, documentName: string, tempDir: string) {
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

    return pandocCommand;
}

async function modifyTexFile(tempDir: string, documentName: string) {
    let data = (await readFile(`${tempDir + documentName}.tex`)).toString();

    data = data.replace(/(TODO|DONE|WAIT|PRGS)/g, '\\statusBadge{$1}');
    data = data.replace(/definecolor{color\\statusBadge{(TODO|PRGS|WAIT|DONE)}}/g, 'definecolor{color$1}');
    data = data.replace(/{\[}(\d\d\d\d-\d?\d-\d?\d\\?\s+\w\w\w){\]}/g, '\\timeStamp{$1}');
    // data = data.replace(/\\section{/g, '\\clearpage\\section{');

    await writeFile(`${tempDir + documentName}.tex`, data, 'utf8');
}


export async function pandocExportAsPdf(context: vscode.ExtensionContext) {
    const documentPath = vscode.window.activeTextEditor.document.uri.fsPath;
    if (!documentPath.match(/\.org$/)) {
        vscode.window.showErrorMessage('Cannot pandoc export from non Org-Mode documents');
        throw TypeError('Wrong document type active');
    }
    const documentBaseName = documentPath.replace(/\.org$/, '');
    const documentDir = documentBaseName.replace(/\/[^\/]+$/, '');
    const documentName = documentBaseName.replace(/^.*\//, '');
    const tempDir = documentDir + '/' + `_temp${+new Date() % 1000000}` + '/';
    try {

        await mkdir(tempDir);

        await exec(getPandocCommand(context, documentBaseName, documentName, tempDir));

        await modifyTexFile(tempDir, documentName);

        await exec(`latexmk -cd -pdf -interaction=nonstopmode "${tempDir + documentName}.tex"`);

        await exec(`latexmk "${tempDir + documentName}.tex" -cd -c`);

        await rename(`${tempDir + documentName}.pdf`, `${documentBaseName}.pdf`);

        vscode.window.showInformationMessage('PDF Created');

        await unlink(`${tempDir + documentName}.tex`);
        await rmdir(tempDir);
    } catch(err) {
        console.error(err);
        vscode.window.showErrorMessage(`Some error occured: ${err.message}`)
    }
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
    const codeFolder = vscode.version.indexOf('insider') >= 0 ? 'Code - Insiders' : 'Code';
    const templateName = 'orgModePandocTemplate.latex';

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
