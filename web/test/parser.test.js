import Document from "@lib/thinkabletype/Document";

import { expect, test } from "vitest";

// TODO: Early on we want to connect it to UI, because the process of going back and forth might change how we build it

test("simple markdown", async () => {
    const doc = await Document.parse("Hello World");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World");
    expect(doc.lines).toEqual(["Hello World"]);
    expect(doc.html).toEqual("<p>Hello World</p>");
});

test("multiline markdown", async () => {
    const doc = await Document.parse("Hello World\nAnd Goodbye");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World\nAnd Goodbye");
    expect(doc.lines).toEqual(["Hello World", "And Goodbye"]);
    expect(doc.html).toEqual("<p>Hello World<br>\nAnd Goodbye</p>");
});

test("multiple paragraph markdown", async () => {
    const doc = await Document.parse("Hello World\n\nAnd Goodbye");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World\n\nAnd Goodbye");
    expect(doc.lines).toEqual(["Hello World", "", "And Goodbye"]);
    expect(doc.html).toEqual("<p>Hello World</p>\n<p>And Goodbye</p>");
});

test("multiple paragraph markdown with empty space", async () => {
    const doc = await Document.parse("Hello World\n  \nAnd Goodbye");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World\n  \nAnd Goodbye");
    expect(doc.lines).toEqual(["Hello World", "  ", "And Goodbye"]);
    expect(doc.html).toEqual("<p>Hello World</p>\n<p>And Goodbye</p>");
});

test("hyperedge", async () => {
    const doc = await Document.parse("A -> B -> C");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("A -> B -> C");
    expect(doc.lines).toEqual(["A -> B -> C"]);
    expect(doc.html).toEqual("<p>A -> B -> C</p>");
});

test("hyperedge symbols", async () => {
    const doc = await Document.parse("A -> B -> C");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("A -> B -> C");
    expect(doc.lines).toEqual(["A -> B -> C"]);
    expect(doc.html).toEqual("<p>A -> B -> C</p>");
    console.log(doc.tree.children[0].children[0]);
});

test("hyperedge with markdown", async () => {
    const doc = await Document.parse("This is a hyperedge\nA -> B -> C\nPretty cool");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("This is a hyperedge\nA -> B -> C\nPretty cool");
    expect(doc.lines).toEqual(["This is a hyperedge", "A -> B -> C", "Pretty cool"]);
    expect(doc.html).toEqual("<p>This is a hyperedge<br>\nA -> B -> C<br>\nPretty cool</p>");
});

test("headers", async () => {
    const doc = await Document.parse("# This is a header\nand a body");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("# This is a header\nand a body");
    expect(doc.lines).toEqual(["# This is a header", "and a body"]);
    expect(doc.html).toEqual(`<section><h1>This is a header</h1><p>and a body</p></section>`);
});


// A -> _B -> C
// Start linkifying symbols



// # Symbol -> notes 
// Properties
// GET THIS TO FRONTEND ASAP!



// Need node information

// A --> B
// A ------------> B
// A -this-> B
// A -----this--> B

// Programatically add / ingest / change / move / remove

// Hyperedges
// Symbols
// Headers (Symbols)
// Later (lists / symbols)

/*

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

test("alias", () => {
    const parser = new Parser(`
A1=A
A1 -> B -> C
`);
    const { hyperedges, markdown } = parser;
    expect(markdown).toEqual("");
    expect(hyperedges).toEqual([["A", "B", "C"]]);
});


test("properties", () => {
    const parser = new Parser(`
A -> B -> C
A -> _note -> This is a note on A
`);
    const { hyperedges, markdown } = parser;
    expect(markdown).toEqual("");
    expect(hyperedges).toEqual([
        ["A", "B", "C"],
        ["A", "_note", "This is a note on A"]
    ]);
});

test.only("alias properties", () => {
    const parser = new Parser(`
A1=A
A2=A
A1 -> B -> C
A2 -> 1 -> 2
A1 -> _note -> This is a note on A1
A2 -> _note -> This is a note on A2
`);
    const { hyperedges, markdown } = parser;
    expect(markdown).toEqual("");
    expect(hyperedges).toEqual([
        ["A", "B", "C"],
        ["A", "1", "2"],
        ["A", "_note", "This is a note on A1"],
        ["A", "_note", "This is a note on A2"]
    ]);
});
*/

// Parser should return more initial information...like a UUID with properties attached to it that can be loaded into General Schematics

// alias
// page
// properties
// url
// notes on symbol
// notes on connection?

// export? hrmm
// alias notes
// with alias..give a UUID at start and attach properties to it
// should be part of broader bootstrap into general schematics?


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


// text format is <-
// hyperedge format is _

// so....
// a <- b -> c

// is the same as 

// a -> _b -> c

