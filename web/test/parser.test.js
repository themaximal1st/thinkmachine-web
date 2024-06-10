import Parser from "@lib/thinkabletype/parser";

import { expect, test } from "vitest";

test("simple markdown and html", () => {
    const parser = new Parser("A");
    const { hyperedges, markdown, html } = parser;
    expect(hyperedges).toEqual([]);
    expect(markdown).toEqual("A");
    expect(html).toEqual("<p>A</p>");
});

test("multiline markdown", () => {
    const parser = new Parser(`this is some\nmultiline text`);
    const { hyperedges, markdown, html } = parser;
    expect(markdown).toEqual(`this is some\nmultiline text`);
    expect(html).toEqual("<p>this is some\nmultiline text</p>");
    expect(hyperedges).toEqual([]);
});

test("multi paragraph markdown", () => {
    const parser = new Parser(`this is some\n\nmultiline text`);
    const { hyperedges, markdown, html } = parser;
    expect(markdown).toEqual(`this is some\n\nmultiline text`);
    expect(html).toEqual("<p>this is some</p>\n<p>multiline text</p>");
    expect(hyperedges).toEqual([]);
});

test("simple symbols and connections", () => {
    const parser = new Parser("A -> B -> C");
    const { hyperedges, markdown, html } = parser;
    expect(markdown).toEqual("");
    expect(html).toEqual("");
    expect(hyperedges).toEqual([["A", "B", "C"]]);
});

test("symbols and markdown", () => {
    const parser = new Parser(`
This is some content
A -> B -> C
And then some more content
with a new line
`);
    const { hyperedges, markdown, html } = parser;
    expect(markdown).toEqual("This is some content\nAnd then some more content\nwith a new line");
    expect(html).toEqual("<p>This is some content\nAnd then some more content\nwith a new line</p>");
    expect(hyperedges).toEqual([["A", "B", "C"]]);
});

// symbols
// markdown
// symbols and markdown
// multiline && newlines
// connections
// alias
// page
// properties
// url

/*
test("parse string symbol", () => {
    expect(Parser.parseSymbol("A")).toEqual(["A", null])
});

test("parse string symbol with string meta", () => {
    expect(Parser.parseSymbol("A[hello]")).toEqual(["A", "hello"])
});

test("parse string symbol with env meta", () => {
    expect(Parser.parseSymbol(`A[hello=world and="there is more"]`)).toEqual(["A", { hello: "world", and: "there is more" }])
});

test("export string symbol", () => {
    expect(Parser.exportSymbol("A")).toEqual("A");
});

test("export string symbol with string meta", () => {
    expect(Parser.exportSymbol("A", "hello")).toEqual("A[hello]");
});

test("export string symbol with env meta", () => {
    expect(Parser.exportSymbol("A", { hello: "world", and: "there is more" })).toEqual(`A[hello="world" and="there is more"]`);
});

test("parse hyperedge", () => {
    expect(Parser.parseHyperedge("A,B,C")).toEqual(["A", "B", "C"]);
});

test("parse hyperedge meta string", () => {
    expect(Parser.parseHyperedge("A[hello],B,C")).toEqual(["A[hello]", "B", "C"]);
});

test("parse hyperedge meta env", () => {
    expect(Parser.parseHyperedge("A[hello=world],B,C")).toEqual(["A[hello=world]", "B", "C"]);
});

test("parse string meta with comma", () => {
    expect(Parser.parseSymbol("A[this, is a comma string]")).toEqual(["A", "this, is a comma string"])
});

test("parse hyperedge string meta with comma", () => {
    expect(Parser.parseHyperedge(`A[this, is a comma string],B,C`)).toEqual(["A[this, is a comma string]", "B", "C"]);
});

test("parse hyperedge string meta with comma and quotes", () => {
    expect(Parser.parseHyperedge(`A["this, is a quoted comma string"],B,C`)).toEqual([`A["this, is a quoted comma string"]`, "B", "C"]);
});

test("parse hyperedge meta env with comma and quotes", () => {
    expect(Parser.parseHyperedge(`A[note="this, is a quoted comma string"],B,C`)).toEqual([`A[note="this, is a quoted comma string"]`, "B", "C"]);
});
*/


// A1=A
// A2=A
// A1,B,C
// A2,1,2

// A1,note,This is a note on A1
// A2,note,This is a note on A2


// A1: This is some context
// A1: this=is some=more context=here

// A -> B -> C
// A -> _note -> This is a note on A



// These notes are doing something interesting together....


// Symbols (local vs global)
// Connections
// _properties
// definition:
// explicit [link]


// A -> B -> C
// A -> _note -> This is a note on A

// A -> 1 -> 2
// A -> _note -> This is a note on A...again (overwrites old one)


// A: This is a
// B: This is b
// A -> B
// A -> _url -> https://www.google.com

// The thing about [A] and [B] is they both point towards [C].

// A,B,C
// A,1,2

// A1=A
// A2=A
// A1,B,C
// A2,1,2
// A1,_note,This is a note on the A1
// A2,_note,This is a note on the A2