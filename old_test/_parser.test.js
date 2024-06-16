// General Schematics
// - markdown
// - tree
// - hypergraph


import Document from "@lib/thinkabletype/Document";
import { find } from 'unist-util-find'

import { expect, test } from "vitest";

// TODO: Early on we want to connect it to UI, because the process of going back and forth might change how we build it

test.only("build hyperedges and resource tree", async () => {
    const doc = await Document.parse("Hello World");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World");
    expect(doc.lines).toEqual(["Hello World"]);
    // expect(doc.html).toEqual("<p>Hello World</p>");
    expect(doc.symbols.size).toEqual(0);
    expect(doc.tree.type).toEqual("root");
    expect(doc.tree.children.length).toEqual(1);
});

// import from markdown -> modify -> export to markdown -> import -> double check



/*
test("simple markdown", async () => {
    const doc = await Document.parse("Hello World");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World");
    expect(doc.lines).toEqual(["Hello World"]);
    // expect(doc.html).toEqual("<p>Hello World</p>");
    expect(doc.symbols.size).toEqual(0);
    expect(doc.tree.type).toEqual("root");
    expect(doc.tree.children.length).toEqual(1);
});

test("multiline markdown", async () => {
    const doc = await Document.parse("Hello World\nAnd Goodbye");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World\nAnd Goodbye");
    expect(doc.lines).toEqual(["Hello World", "And Goodbye"]);
    // expect(doc.html).toEqual("<p>Hello World<br>\nAnd Goodbye</p>");
    expect(doc.symbols.size).toEqual(0);
    expect(doc.tree.children.length).toEqual(1);
    expect(doc.tree.children[0].children.length).toEqual(3); // text, break, text
});

test("multiple paragraph markdown", async () => {
    const doc = await Document.parse("Hello World\n\nAnd Goodbye");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World\n\nAnd Goodbye");
    expect(doc.lines).toEqual(["Hello World", "", "And Goodbye"]);
    // expect(doc.html).toEqual("<p>Hello World</p>\n<p>And Goodbye</p>");
    expect(doc.symbols.size).toEqual(0);
});

test("multiple paragraph markdown with empty space", async () => {
    const doc = await Document.parse("Hello World\n  \nAnd Goodbye");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("Hello World\n  \nAnd Goodbye");
    expect(doc.lines).toEqual(["Hello World", "  ", "And Goodbye"]);
    // expect(doc.html).toEqual("<p>Hello World</p>\n<p>And Goodbye</p>");
    expect(doc.symbols.size).toEqual(0);
});

test("hyperedge", async () => {
    const doc = await Document.parse("A -> B -> C");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("A -> B -> C");
    expect(doc.lines).toEqual(["A -> B -> C"]);
    // expect(doc.html).toEqual("<p>A -> B -> C</p>");
    expect(doc.symbols.size).toEqual(3);
});

test("hyperedge symbols", async () => {
    const doc = await Document.parse("A -> B -> C");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("A -> B -> C");
    expect(doc.lines).toEqual(["A -> B -> C"]);
    // expect(doc.html).toEqual("<p>A -> B -> C</p>");
    expect(doc.symbols.size).toEqual(3);
});

test("hyperedge with markdown", async () => {
    const doc = await Document.parse("This is a hyperedge\nA -> B -> C\nPretty cool");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("This is a hyperedge\nA -> B -> C\nPretty cool");
    expect(doc.lines).toEqual(["This is a hyperedge", "A -> B -> C", "Pretty cool"]);
    // expect(doc.html).toEqual("<p>This is a hyperedge<br>\nA -> B -> C<br>\nPretty cool</p>");
    expect(doc.symbols.size).toEqual(3);
});

test("headers", async () => {
    const doc = await Document.parse("# This is a header\nand a body");
    expect(doc.hyperedges).toEqual([]);
    expect(doc.markdown).toEqual("# This is a header\nand a body");
    expect(doc.lines).toEqual(["# This is a header", "and a body"]);
    // expect(doc.html).toEqual(`<section><h1>This is a header</h1><p>and a body</p></section>`);
});

test("node symbol and edge connections", async () => {
    const doc = await Document.parse("A -> B -> C\n\nA is the first letter of the alphabet.");
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    expect(doc.markdown).toEqual("A -> B -> C\n\nA is the first letter of the alphabet.");
    expect(doc.lines).toEqual(["A -> B -> C", "", "A is the first letter of the alphabet."]);
    const text1 = find(doc.tree, { value: "A -> B -> C" });
    expect(text1.type).toEqual("text");
    expect(text1.hyperedge).toEqual(true);

    const p2 = doc.tree.children[1];
    expect(p2.type).toEqual("paragraph");
    expect(p2.children[0].symbols).toEqual(["A"]);
    expect(p2.children[0].hyperedges).toEqual([["A", "B", "C"]]);
});

test("doesn't link characters...only symbols", async () => {
    const doc = await Document.parse(`
A -> B -> C

Because this one shouldn't link.
`);
    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    const text1 = find(doc.tree, { value: "A -> B -> C" });
    expect(text1.type).toEqual("text");
    expect(text1.hyperedge).toEqual(true);

    const p2 = doc.tree.children[1];
    expect(p2.type).toEqual("paragraph");
    expect(p2.symbols).toEqual(undefined);
    expect(p2.hyperedges).toEqual(undefined);
    expect(p2.children.length).toEqual(1);
    expect(p2.children[0].type).toEqual("text");
    expect(p2.children[0].value).toEqual("Because this one shouldn't link.");
});

test("multiple edges attached", async () => {
    const doc = await Document.parse(`
A -> B -> C
A -> 1 -> 2

A is the root node.
`);
    expect(doc.hyperedges).toEqual([["A", "B", "C"], ["A", "1", "2"]]);
    const text1 = find(doc.tree, { value: "A -> B -> C" });
    expect(text1.type).toEqual("text");
    expect(text1.hyperedge).toEqual(true);

    const text2 = find(doc.tree, { value: "A -> 1 -> 2" });
    expect(text2.type).toEqual("text");
    expect(text2.hyperedge).toEqual(true);

    const p2 = doc.tree.children[1];
    expect(p2.type).toEqual("paragraph");
    expect(p2.children.length).toEqual(2);

    expect(p2.children[0].type).toEqual("link");
    expect(p2.children[0].symbols).toEqual(["A"]);
    expect(p2.children[0].hyperedges).toEqual([["A", "B", "C"], ["A", "1", "2"]]);
    expect(p2.children[1].type).toEqual("text");
    expect(p2.children[1].value).toEqual(" is the root node.");
});

test("symbol into link", async () => {
    const doc = await Document.parse(`
A -> B -> C

A is the root node.
`);

    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    const text1 = find(doc.tree, { value: "A -> B -> C" });
    expect(text1.type).toEqual("text");
    expect(text1.hyperedge).toEqual(true);

    const p1 = doc.tree.children[1];
    expect(p1.type).toEqual("paragraph");
    expect(p1.children[0].type).toEqual("link");
    expect(p1.children[0].symbols).toEqual(["A"]);
    expect(p1.children[0].hyperedges).toEqual([["A", "B", "C"]]);
    expect(p1.children[1].type).toEqual("text");
    expect(p1.children[1].value).toEqual(" is the root node.");

    expect(doc.html).toEqual(`<p>A -> B -> C</p>\n<p><a href="#A">A</a> is the root node.</p>`);
});

test("multiple symbol into link", async () => {
    const doc = await Document.parse(`
A -> B -> C

A is the root node and B comes second.

A is also the first letter of the alphabet.
`);

    expect(doc.hyperedges).toEqual([["A", "B", "C"]]);
    const text1 = find(doc.tree, { value: "A -> B -> C" });
    expect(text1.type).toEqual("text");
    expect(text1.hyperedge).toEqual(true);

    const p2 = doc.tree.children[1];
    expect(p2.type).toEqual("paragraph");
    expect(p2.children[0].type).toEqual("link");
    expect(p2.children[0].symbols).toEqual(["A"]);
    expect(p2.children[0].hyperedges).toEqual([["A", "B", "C"]]);
    expect(p2.children[1].type).toEqual("text");
    expect(p2.children[1].value).toEqual(" is the root node and ");
    expect(p2.children[2].type).toEqual("link");
    expect(p2.children[2].symbols).toEqual(["B"]);
    expect(p2.children[2].hyperedges).toEqual([["A", "B", "C"]]);

    const p3 = doc.tree.children[2];
    expect(p3.type).toEqual("paragraph");
    expect(p3.children[0].type).toEqual("link");
    expect(p3.children[0].symbols).toEqual(["A"]);
    expect(p3.children[0].hyperedges).toEqual([["A", "B", "C"]]);
    expect(p3.children[1].type).toEqual("text");
    expect(p3.children[1].value).toEqual(" is also the first letter of the alphabet.");

    expect(doc.html).toEqual(`<p>A -> B -> C</p>\n<p><a href="#A">A</a> is the root node and <a href="#B">B</a> comes second.</p>\n<p><a href="#A">A</a> is also the first letter of the alphabet.</p>`);
});

test("hyperedge long arrow", async () => {
    const doc = await Document.parse("A -> B --> C   --->D-------->E");
    expect(doc.hyperedges).toEqual([["A", "B", "C", "D", "E"]]);
    expect(doc.symbols.size).toEqual(5);
});

test("document hyperedge urn", async () => {
    const doc = await Document.parse("A -> B -> C");
    expect(doc.urn(["A"])).toEqual("info:A"); // undeprecating info: ...you heard it here.
    expect(doc.urn(["A", "B"])).toEqual("info:A/B");
    expect(doc.urn(["A", "B", "C"])).toEqual("info:A/B/C");
});

test("document hyperedge urn namespace", async () => {
    const doc = await Document.parse("A -> B -> C", "memex");
    expect(doc.urn(["A"])).toEqual("info:memex:A"); // undeprecating info: ...you heard it here.
    expect(doc.urn(["A", "B"])).toEqual("info:memex:A/B");
    expect(doc.urn(["A", "B", "C"])).toEqual("info:memex:A/B/C");
});
*/

// parse into hypergraph...need notes and edges


// TODO: doc.hypergraph ...parse hyperedges with meta data  / tree and left over nodes

// Symbol...and a note for that symbol
// Implicit symbol: paragraph
// Implicit symbol: header / section


// # Symbol -> notes 
// _Properties
// GET THIS TO FRONTEND ASAP!
// EDGE names --like this-->
// How to prevent a random -> arrow in a paragraph from being a hyperedge?


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



// remark-sectionize
// remark-squeeze-paragraphs
// textr -> beautiful typography
// rehype-react
// Headers -> paragraph need to be connected..or this is what I need to build
// ```hyperedges support but also just support it inline
// Think of these as different plugins you can combine together
// Ensure HTML comments still work

// useful to add
// remark-abbr -> abbreviations...a short-form of a note. *[ABBR]: Abbreviation
// remark-admonitions -> callouts
// remark-directive -> extend markdown :::directive
// remark-attr -> custom attrbiutes {a: 123, b: 456}
// remark-breaks -> soft breaks maybe matches expectations better
// remark-capitalize -> consistent symbol names
// remark-cite -> citations...using all kinds of different formats though
// remark-code-frontmatter -> weird idea
// remark-container -> interesting container idea :::
// remark-copy-linked-files -> cool...save remove files locally
// remark-defsplit -> turn references into definitions
// remark-flexible-containers -> callouts
// remark-images -> nice images
// remark-lint && remark-prettier -> might be nice
// remark-ping -> ping a @user
// remark-normalize-headings
// remark-redact -> remark-hashify -> your symbols also have a hash table /~ redacted ~/.... /~ A ~/ -> B -> C
// remark-shortcodes -> embed content
// retext-diacritics -> accents
