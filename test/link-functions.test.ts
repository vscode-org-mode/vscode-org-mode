import * as assert from "assert";
import * as os from "os";
import * as vscode from "vscode";
import {
  linkProperties,
  openLink,
  optionRange,
  parseSearchOption,
  Link,
  LinkSearchOption,
} from "../src/link-functions";

async function openOrgDoc(content: string): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument({ language: "org", content });
}

function assertOption(
  link: Link | undefined,
  expected: LinkSearchOption | undefined,
) {
  assert.ok(link, "expected a parsed link");
  assert.deepStrictEqual(link!.options, expected);
}

suite("linkProperties", () => {
  test("in-document headline", () => {
    assertOption(linkProperties("*My Heading"), {
      kind: "headline",
      headline: "My Heading",
    });
  });

  test("in-document custom id", () => {
    assertOption(linkProperties("#intro"), {
      kind: "id-property",
      id: "intro",
    });
  });

  test("regex option via ::/re/ on a file link", () => {
    assertOption(linkProperties("file:/tmp/a.org::/TO..*/"), {
      kind: "regex",
      regex: "TO..*",
    });
  });

  test("bare /path/ is a file path, not a regex (matches Emacs)", () => {
    // `[[/regex/]]` without `::` context is interpreted as an absolute
    // file path named `/regex/`, because `/` triggers file-link autoprefix.
    const link = linkProperties("/regex/");
    assert.strictEqual(link?.uri, "/regex/");
    assert.strictEqual(link?.options, undefined);
  });

  test("in-document fuzzy target", () => {
    assertOption(linkProperties("Some Section Name"), {
      kind: "target",
      target: "Some Section Name",
    });
  });

  test("in-document fuzzy with internal colons is not external", () => {
    // Prose like `Time: 10:00` has a colon but isn't a URI.
    assertOption(linkProperties("Time: 10:00"), {
      kind: "target",
      target: "Time: 10:00",
    });
  });

  test("in-document link has no uri", () => {
    const link = linkProperties("*Heading");
    assert.strictEqual(link?.uri, undefined);
  });

  test("file link with absolute path", () => {
    const link = linkProperties("file:/tmp/notes.org");
    assert.strictEqual(link?.uri, "/tmp/notes.org");
    assert.strictEqual(link?.options, undefined);
  });

  test("file link via leading slash auto-prefix", () => {
    const link = linkProperties("/tmp/notes.org");
    assert.strictEqual(link?.uri, "/tmp/notes.org");
  });

  test("file link via leading dot auto-prefix", () => {
    const link = linkProperties("./notes.org");
    assert.strictEqual(link?.uri, "./notes.org");
  });

  test("file link keeps relative paths relative", () => {
    // Resolution against the source document happens in openLink, not here.
    const link = linkProperties("./sub/notes.org");
    assert.strictEqual(link?.uri, "./sub/notes.org");
  });

  test("file link with ~ expansion", () => {
    const link = linkProperties("file:~/notes.org");
    assert.strictEqual(link?.uri, `${os.homedir()}/notes.org`);
  });

  test("file link with env var expansion", () => {
    const prev = process.env["ORG_TEST_VAR"];
    process.env["ORG_TEST_VAR"] = "/tmp/work";
    try {
      const link = linkProperties("file:$ORG_TEST_VAR/notes.org");
      assert.strictEqual(link?.uri, "/tmp/work/notes.org");
    } finally {
      if (prev === undefined) delete process.env["ORG_TEST_VAR"];
      else process.env["ORG_TEST_VAR"] = prev;
    }
  });

  test("file link with braced env var", () => {
    const prev = process.env["ORG_TEST_VAR"];
    process.env["ORG_TEST_VAR"] = "/tmp/work";
    try {
      const link = linkProperties("file:${ORG_TEST_VAR}/notes.org");
      assert.strictEqual(link?.uri, "/tmp/work/notes.org");
    } finally {
      if (prev === undefined) delete process.env["ORG_TEST_VAR"];
      else process.env["ORG_TEST_VAR"] = prev;
    }
  });

  test("file link with line option", () => {
    assertOption(linkProperties("file:/tmp/a.org::42"), {
      kind: "line",
      line: 42,
    });
  });

  test("file link with headline option", () => {
    assertOption(linkProperties("file:/tmp/a.org::*Intro"), {
      kind: "headline",
      headline: "Intro",
    });
  });

  test("file link with custom id option", () => {
    assertOption(linkProperties("file:/tmp/a.org::#intro"), {
      kind: "id-property",
      id: "intro",
    });
  });

  test("file link with fuzzy target option", () => {
    assertOption(linkProperties("file:/tmp/a.org::Target Text"), {
      kind: "target",
      target: "Target Text",
    });
  });

  test("empty-path file: form refers to current doc with option", () => {
    const link = linkProperties("file:::*Heading");
    assert.strictEqual(link?.uri, undefined);
    assert.deepStrictEqual(link?.options, {
      kind: "headline",
      headline: "Heading",
    });
  });

  test("https external returns undefined", () => {
    assert.strictEqual(linkProperties("https://example.com"), undefined);
  });

  test("http external returns undefined", () => {
    assert.strictEqual(linkProperties("http://example.com"), undefined);
  });

  test("mailto external returns undefined", () => {
    assert.strictEqual(linkProperties("mailto:x@y.z"), undefined);
  });

  test("unknown non-slash scheme is treated as in-document", () => {
    // `slack:` is not in the default externalLinkSchemes.
    assertOption(linkProperties("slack:channel"), {
      kind: "target",
      target: "slack:channel",
    });
  });

  test("remote ssh-style path is not supported (returns undefined)", () => {
    assert.strictEqual(linkProperties("file:/ssh:host:/path.org"), undefined);
  });
});

suite("parseSearchOption", () => {
  test("numeric → line", () => {
    assert.deepStrictEqual(parseSearchOption("42"), {
      kind: "line",
      line: 42,
    });
  });

  test("leading * → headline", () => {
    assert.deepStrictEqual(parseSearchOption("*My Heading"), {
      kind: "headline",
      headline: "My Heading",
    });
  });

  test("leading # → id-property", () => {
    assert.deepStrictEqual(parseSearchOption("#intro"), {
      kind: "id-property",
      id: "intro",
    });
  });

  test("/pat/ → regex", () => {
    assert.deepStrictEqual(parseSearchOption("/TODO/"), {
      kind: "regex",
      regex: "TODO",
    });
  });

  test("leading / without trailing / is not a regex", () => {
    // `/foo` (single slash) falls through to target, matching Emacs.
    assert.deepStrictEqual(parseSearchOption("/foo"), {
      kind: "target",
      target: "/foo",
    });
  });

  test("empty string → undefined", () => {
    assert.strictEqual(parseSearchOption(""), undefined);
  });

  test("plain text → target", () => {
    assert.deepStrictEqual(parseSearchOption("find me"), {
      kind: "target",
      target: "find me",
    });
  });
});

suite("optionRange", () => {
  test("line option jumps to 1-indexed line", async () => {
    const doc = await openOrgDoc("one\ntwo\nthree\n");
    const range = optionRange(doc, { kind: "line", line: 2 });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 1);
  });

  test("line option out of range returns undefined", async () => {
    const doc = await openOrgDoc("only one line\n");
    const range = optionRange(doc, { kind: "line", line: 99 });
    assert.strictEqual(range, undefined);
  });

  test("headline matches stripping TODO, priority, tags, stats", async () => {
    const doc = await openOrgDoc(
      "* preamble\n" +
        "** TODO [#A] Implementation [1/3] :work:urgent:\n" +
        "body\n",
    );
    const range = optionRange(doc, {
      kind: "headline",
      headline: "Implementation",
    });
    assert.ok(range, "expected headline match");
    assert.strictEqual(range!.start.line, 1);
  });

  test("headline match is case-insensitive", async () => {
    const doc = await openOrgDoc("* Hello World\n");
    const range = optionRange(doc, {
      kind: "headline",
      headline: "hello world",
    });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 0);
  });

  test("headline does not match when extra words present", async () => {
    // Word-equality comparison — "My great heading" != "My heading".
    const doc = await openOrgDoc("* My great heading\n");
    const range = optionRange(doc, {
      kind: "headline",
      headline: "My heading",
    });
    assert.strictEqual(range, undefined);
  });

  test("id-property returns range of the enclosing headline", async () => {
    const doc = await openOrgDoc(
      "* First\n" +
        "* Target section\n" +
        ":PROPERTIES:\n" +
        ":CUSTOM_ID: my-id\n" +
        ":END:\n" +
        "body\n",
    );
    const range = optionRange(doc, { kind: "id-property", id: "my-id" });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 1);
  });

  test("target finds <<dedicated>> over fuzzy text", async () => {
    // Plain "target" text appears on line 0, <<target>> on line 2.
    // Dedicated target should win.
    const doc = await openOrgDoc(
      "plain target here\n" + "\n" + "then <<target>> here\n",
    );
    const range = optionRange(doc, { kind: "target", target: "target" });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 2);
  });

  test("target falls through to #+NAME when no <<target>>", async () => {
    const doc = await openOrgDoc(
      "unrelated\n" +
        "#+NAME: my-block\n" +
        "#+BEGIN_SRC\n" +
        "code\n" +
        "#+END_SRC\n",
    );
    const range = optionRange(doc, {
      kind: "target",
      target: "my-block",
    });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 1);
  });

  test("target falls through to headline match", async () => {
    const doc = await openOrgDoc(
      "some text\n" + "* Meeting Notes\n" + "body\n",
    );
    const range = optionRange(doc, {
      kind: "target",
      target: "Meeting Notes",
    });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 1);
  });

  test("target falls through to plain fuzzy text", async () => {
    const doc = await openOrgDoc("first line\nhello world here\n");
    const range = optionRange(doc, {
      kind: "target",
      target: "hello world",
    });
    assert.ok(range);
    assert.strictEqual(range!.start.line, 1);
  });

  test("target fuzzy tolerates flexible whitespace", async () => {
    // Line wrap between words should still match.
    const doc = await openOrgDoc("hello\n    world tail\n");
    const range = optionRange(doc, {
      kind: "target",
      target: "hello world",
    });
    assert.ok(range);
  });

  test("regex option returns first match", async () => {
    const doc = await openOrgDoc("aaa 123 bbb 456\n");
    const range = optionRange(doc, { kind: "regex", regex: "\\d+" });
    assert.ok(range);
    const text = doc.getText(range);
    assert.strictEqual(text, "123");
  });

  test("no match returns undefined", async () => {
    const doc = await openOrgDoc("nothing interesting\n");
    const range = optionRange(doc, {
      kind: "target",
      target: "missing words",
    });
    assert.strictEqual(range, undefined);
  });
});

suite("openLink cursor placement", () => {
  test("moves cursor when the current doc is already open", async () => {
    const doc = await openOrgDoc("* First\n* Target\nbody\n");
    const editor = await vscode.window.showTextDocument(doc);
    const origin = new vscode.Position(0, 0);
    editor.selection = new vscode.Selection(origin, origin);

    await openLink(editor, undefined as unknown as vscode.TextEditorEdit, "*Target");

    assert.strictEqual(vscode.window.activeTextEditor?.selection.active.line, 1);
  });

  test("moves cursor on second follow to the same option", async () => {
    // After the first follow, the target editor is already open with the cursor
    // at the target line. A second follow to a DIFFERENT option in the same
    // doc must still move the cursor — not leave it at the prior target.
    const doc = await openOrgDoc("* First\n* Target\n* Third\n");
    const editor = await vscode.window.showTextDocument(doc);
    editor.selection = new vscode.Selection(
      new vscode.Position(0, 0),
      new vscode.Position(0, 0),
    );

    await openLink(editor, undefined as unknown as vscode.TextEditorEdit, "*Third");
    assert.strictEqual(vscode.window.activeTextEditor?.selection.active.line, 2);

    await openLink(editor, undefined as unknown as vscode.TextEditorEdit, "*Target");
    assert.strictEqual(vscode.window.activeTextEditor?.selection.active.line, 1);
  });
});
