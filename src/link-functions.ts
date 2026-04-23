import * as os from "os";
import * as vscode from "vscode";
import { dirname, resolve } from "path";
import { getExternalLinkSchemes, getKeywords } from "./utils";

/**
 * Types of searches that can be made in addition to matching a file name.
 *
 * Defined here: https://orgmode.org/manual/Search-Options.html
 */
export type LinkSearchOption =
  | { kind: "line"; line: number }
  | { kind: "target"; target: string }
  | { kind: "headline"; headline: string }
  | { kind: "id-property"; id: string }
  | { kind: "regex"; regex: string };

export type Link = {
  kind: "file";
  uri: string | undefined;
  options?: LinkSearchOption;
};

const BRACKET_LINK_RE = /\[\[([^\]\n]+?)\](?:\[([^\]\n]+?)\])?\]/;
const BRACKET_LINK_RE_G = /\[\[([^\]\n]+?)\](?:\[([^\]\n]+?)\])?\]/g;
const HEADING_LINE_RE = /^(\*+)[ \t]+(.*)$/;
const HEADING_PREFIX_RE = /^\*+[ \t]/;
const NAME_LINE_RE = /^[ \t]*#\+NAME:[ \t]+(.+?)[ \t]*$/i;
const COMMENT_DECORATION_RE = /^COMMENT[ \t]+/;
const PRIORITY_COOKIE_RE = /^\[#[A-Za-z0-9]\][ \t]+/;
const TRAILING_TAGS_RE = /[ \t]+:[A-Za-z0-9_@#%:]+:[ \t]*$/;
const STATS_COOKIE_RE = /[ \t]*\[\d*(?:\/\d*|%)\]/g;
const URL_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//;

export function linkProperties(linkStr: string): Link | undefined {
  // Path-like bodies default to file protocol. See:
  // https://orgmode.org/manual/External-Links.html
  if (/^[./]/.test(linkStr)) {
    linkStr = `file:${linkStr}`;
  }

  // In-document link: no `file:` prefix and no other external protocol. The
  // whole body is a search option (`*Heading`, `#id`, `/regex/`, `Some text`).
  // Bodies like `Time: 10:00` keep `:` but aren't URIs — only treat as external
  // when URL-shaped (`scheme://`) or one of the user-configured non-slash
  // schemes (`mailto:`, `tel:`, …).
  if (!linkStr.startsWith("file:")) {
    if (looksExternal(linkStr)) return undefined;
    return {
      kind: "file",
      uri: undefined,
      options: parseSearchOption(linkStr),
    };
  }

  const rest = linkStr.slice("file:".length);
  const sepIdx = rest.indexOf("::");
  const path = sepIdx === -1 ? rest : rest.slice(0, sepIdx);
  const rawOption = sepIdx === -1 ? undefined : rest.slice(sepIdx + 2);

  // TODO: Remote paths like `/ssh:me@host:<path>` aren't supported yet.
  if (path.includes(":")) return undefined;

  // Replace `~` with home, but only when followed by `/` or end-of-string.
  // Use a lookahead so the `/` isn't consumed (homedir() has no trailing slash).
  const homeExpandedPath = path.replace(/^~(?=\/|$)/, os.homedir());
  const varExpandedPath = homeExpandedPath.replace(
    /\$\{(\w+)\}|\$(\w+)/g,
    (_, braced, bare) => process.env[braced ?? bare] ?? "",
  );
  // Leave relative vs. absolute alone — the caller resolves against the source
  // document's directory, which is the only place that knows the correct base.
  const fileUri = varExpandedPath === "" ? undefined : varExpandedPath;

  return {
    kind: "file",
    uri: fileUri,
    options: rawOption ? parseSearchOption(rawOption) : undefined,
  };
}

function looksExternal(linkStr: string): boolean {
  if (URL_SCHEME_RE.test(linkStr)) return true;
  // Non-URL schemes (`mailto:`, `tel:`, …) require an explicit opt-in so prose
  // like `Time: 10:00` isn't misread as an external link.
  return getExternalLinkSchemes().some((s) => linkStr.startsWith(`${s}:`));
}

export function parseSearchOption(raw: string): LinkSearchOption | undefined {
  if (!raw) return undefined;
  if (/^[0-9]+$/.test(raw)) {
    return { kind: "line", line: parseInt(raw, 10) };
  }
  if (raw.startsWith("*")) {
    return { kind: "headline", headline: raw.substring(1) };
  }
  if (raw.startsWith("#")) {
    return { kind: "id-property", id: raw.substring(1) };
  }
  const regexMatch = raw.match(/^\/(.+)\/$/);
  if (regexMatch) {
    return { kind: "regex", regex: regexMatch[1] };
  }
  return { kind: "target", target: raw };
}

export function optionRange(
  doc: vscode.TextDocument,
  searchOption: LinkSearchOption,
): vscode.Range | undefined {
  switch (searchOption.kind) {
    case "line":
      return lineRange(doc, searchOption.line);
    case "id-property":
      return findCustomId(doc, searchOption.id);
    case "headline":
      return findHeadline(doc, searchOption.headline);
    case "target":
      // Fuzzy cascade, mirrors `org-link-search` in ol.el:
      // <<dedicated target>> → #+NAME: → headline → plain text fallback.
      return (
        findDedicatedTarget(doc, searchOption.target) ??
        findNameTarget(doc, searchOption.target) ??
        findHeadline(doc, searchOption.target) ??
        findFuzzyText(doc, searchOption.target)
      );
    case "regex":
      return findRegex(doc, searchOption.regex);
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(s: string): string {
  return s.replace(/\n[ \t]*/g, " ").trim();
}

function wordsOf(s: string): string[] {
  return normalize(s).split(/\s+/).filter(Boolean);
}

function multiLineRe(words: string[]): string {
  return words.map(escapeRe).join("[ \\t\\n]+");
}

function rangeFromMatch(
  doc: vscode.TextDocument,
  m: RegExpExecArray,
): vscode.Range {
  const start = doc.positionAt(m.index);
  const end = doc.positionAt(m.index + m[0].length);
  return new vscode.Range(start, end);
}

function lineRange(
  doc: vscode.TextDocument,
  line: number,
): vscode.Range | undefined {
  const idx = Math.max(0, line - 1);
  if (idx >= doc.lineCount) return undefined;
  return doc.lineAt(idx).range;
}

function lineIndices(doc: vscode.TextDocument): number[] {
  return Array.from({ length: doc.lineCount }, (_, i) => i);
}

function findLineIndex(
  doc: vscode.TextDocument,
  predicate: (line: string) => boolean,
): number | undefined {
  return lineIndices(doc).find((i) => predicate(doc.lineAt(i).text));
}

function upperCaseWords(s: string): string[] {
  return s.split(/\s+/).filter(Boolean).map((w) => w.toUpperCase());
}

function findDedicatedTarget(
  doc: vscode.TextDocument,
  s: string,
): vscode.Range | undefined {
  const words = wordsOf(s);
  if (words.length === 0) return undefined;
  const re = new RegExp(`<<${multiLineRe(words)}>>`, "i");
  const m = re.exec(doc.getText());
  return m ? rangeFromMatch(doc, m) : undefined;
}

function findNameTarget(
  doc: vscode.TextDocument,
  s: string,
): vscode.Range | undefined {
  const target = upperCaseWords(normalize(s));
  if (target.length === 0) return undefined;
  const hit = findLineIndex(doc, (line) => {
    const m = line.match(NAME_LINE_RE);
    return m ? arraysEqual(upperCaseWords(m[1]), target) : false;
  });
  return hit === undefined ? undefined : doc.lineAt(hit).range;
}

function findHeadline(
  doc: vscode.TextDocument,
  s: string,
): vscode.Range | undefined {
  const target = upperCaseWords(normalize(s));
  if (target.length === 0) return undefined;
  const todos = (getKeywords() ?? []).filter(Boolean);
  const todoRe = todos.length > 0
    ? new RegExp(`^(?:${todos.map(escapeRe).join("|")})[ \\t]+`)
    : null;
  const hit = findLineIndex(doc, (line) => {
    const hm = line.match(HEADING_LINE_RE);
    if (!hm) return false;
    const title = stripHeadingDecorations(hm[2], todoRe);
    return arraysEqual(upperCaseWords(title), target);
  });
  return hit === undefined ? undefined : doc.lineAt(hit).range;
}

function stripHeadingDecorations(title: string, todoRe: RegExp | null): string {
  return [
    todoRe,
    COMMENT_DECORATION_RE,
    PRIORITY_COOKIE_RE,
    TRAILING_TAGS_RE,
    STATS_COOKIE_RE,
  ]
    .filter((re): re is RegExp => re !== null)
    .reduce((acc, re) => acc.replace(re, ""), title)
    .trim();
}

function findCustomId(
  doc: vscode.TextDocument,
  id: string,
): vscode.Range | undefined {
  const re = new RegExp(
    `^[ \\t]*:CUSTOM_ID:[ \\t]+${escapeRe(id)}[ \\t]*$`,
    "i",
  );
  const hit = findLineIndex(doc, (line) => re.test(line));
  if (hit === undefined) return undefined;
  // Jump to the enclosing headline, matching Emacs' behavior.
  const heading = lineIndices(doc)
    .slice(0, hit)
    .reverse()
    .find((j) => HEADING_PREFIX_RE.test(doc.lineAt(j).text));
  return doc.lineAt(heading ?? hit).range;
}

function findFuzzyText(
  doc: vscode.TextDocument,
  s: string,
): vscode.Range | undefined {
  const words = wordsOf(s);
  if (words.length === 0) return undefined;
  const re = new RegExp(multiLineRe(words), "i");
  const text = doc.getText();
  const m = re.exec(text);
  return m ? rangeFromMatch(doc, m) : undefined;
}

function findRegex(
  doc: vscode.TextDocument,
  pattern: string,
): vscode.Range | undefined {
  try {
    const re = new RegExp(pattern, "i");
    const text = doc.getText();
    const m = re.exec(text);
    return m ? rangeFromMatch(doc, m) : undefined;
  } catch {
    return undefined;
  }
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

export async function openLink(
  textEditor: vscode.TextEditor,
  _edit: vscode.TextEditorEdit,
  linkBody?: string,
) {
  const doc = textEditor.document;
  const body = linkBody ?? linkBodyAtCursor(textEditor);
  if (!body) {
    vscode.window.showInformationMessage("No link at cursor");
    return;
  }
  await dispatchLink(doc, body);
}

function linkBodyAtCursor(editor: vscode.TextEditor): string | undefined {
  const range = editor.document.getWordRangeAtPosition(
    editor.selection.active,
    BRACKET_LINK_RE,
  );
  if (!range) return undefined;
  return editor.document.getText(range).match(BRACKET_LINK_RE)?.[1];
}

async function dispatchLink(sourceDoc: vscode.TextDocument, body: string) {
  const link = linkProperties(body);
  if (link) {
    await openFileLink(sourceDoc, link);
  } else {
    await openExternal(body);
  }
}

async function openExternal(body: string) {
  try {
    const ok = await vscode.env.openExternal(vscode.Uri.parse(body, true));
    if (!ok) {
      vscode.window.showInformationMessage(`Could not open: ${body}`);
    }
  } catch {
    vscode.window.showInformationMessage(`Unsupported link: ${body}`);
  }
}

async function openFileLink(sourceDoc: vscode.TextDocument, link: Link) {
  const targetDoc = await resolveTargetDoc(sourceDoc, link.uri);
  if (!targetDoc) return;

  const matchRange = link.options
    ? optionRange(targetDoc, link.options)
    : undefined;

  if (link.options && !matchRange) {
    vscode.window.showWarningMessage(
      "Link opened, but no match found for search option",
    );
  }

  const caret = matchRange
    ? new vscode.Range(matchRange.start, matchRange.start)
    : new vscode.Range(0, 0, 0, 0);

  const editor = await vscode.window.showTextDocument(targetDoc, {
    selection: caret,
    preview: false,
  });

  if (matchRange) {
    editor.revealRange(
      matchRange,
      vscode.TextEditorRevealType.InCenterIfOutsideViewport,
    );
  }
}

async function resolveTargetDoc(
  sourceDoc: vscode.TextDocument,
  linkUri: string | undefined,
): Promise<vscode.TextDocument | undefined> {
  if (linkUri === undefined) return sourceDoc;
  const absPath = resolve(dirname(sourceDoc.uri.fsPath), linkUri);
  try {
    return await vscode.workspace.openTextDocument(vscode.Uri.file(absPath));
  } catch (err) {
    vscode.window.showErrorMessage(
      `Could not open ${absPath}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return undefined;
  }
}

export class OrgDocumentLinkProvider implements vscode.DocumentLinkProvider {
  provideDocumentLinks(doc: vscode.TextDocument): vscode.DocumentLink[] {
    return lineIndices(doc).flatMap((lineNum) =>
      bracketMatchesOnLine(doc.lineAt(lineNum).text).map((m) => {
        const body = m[1];
        const range = new vscode.Range(
          lineNum,
          m.index,
          lineNum,
          m.index + m[0].length,
        );
        const args = encodeURIComponent(JSON.stringify([body]));
        const target = vscode.Uri.parse(`command:org.openLink?${args}`);
        const link = new vscode.DocumentLink(range, target);
        link.tooltip = `Open ${body}`;
        return link;
      }),
    );
  }
}

function bracketMatchesOnLine(line: string): RegExpExecArray[] {
  // Reusing the module-level global regex requires resetting lastIndex; safe
  // because JS is single-threaded and nobody else holds a reference mid-exec.
  BRACKET_LINK_RE_G.lastIndex = 0;
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = BRACKET_LINK_RE_G.exec(line)) !== null) {
    out.push(m);
  }
  return out;
}
