import GeneralSchematics from "@lib/generalschematics"

import { expect, test, beforeAll } from "vitest";

// test high-level API — specifics are handled in other tests

test("parse simple doc", async () => {
    const schematic = new GeneralSchematics("Hello World");
    expect(schematic.input).toEqual("Hello World");
    expect(schematic.html).toEqual("<p>Hello World</p>");
    expect(schematic.hyperedges).toEqual([]);
});

test("parse hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.input).toEqual("A -> B -> C");
    expect(schematic.html).toEqual("<p>A -> B -> C</p>");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);
});

test("parse hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nA is the first letter of the alphabet");
    expect(schematic.html).toEqual("<p>A -> B -> C<br>\nA is the first letter of the alphabet</p>");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);

    const hypertext = schematic.hypertext.get("A");
    expect(hypertext.length).toEqual(1);
    expect(hypertext[0]).toEqual("A is the first letter of the alphabet");
});

test("parse multiple hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nA is the first letter of the alphabet while B is the second.\nA is also usually associated with numeric value 1");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);

    let hypertext = schematic.hypertext.get("A");
    expect(hypertext.length).toEqual(2);
    expect(hypertext[0]).toEqual("A is the first letter of the alphabet while B is the second.");
    expect(hypertext[1]).toEqual("A is also usually associated with numeric value 1");

    hypertext = schematic.hypertext.get("B");
    expect(hypertext.length).toEqual(1);
    expect(hypertext[0]).toEqual("A is the first letter of the alphabet while B is the second.");
});

test("simple doc export", async () => {
    const schematic = new GeneralSchematics("hello world");
    const doc = schematic.export();
    expect(doc).toEqual("hello world");
});

test("simple hyperedge export", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const doc = schematic.export();
    expect(doc).toEqual("A -> B -> C");
});

test("simple hypertext export", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nA is the first letter of the alphabet");
    const doc = schematic.export();
    expect(doc).toEqual("A -> B -> C\n\nA is the first letter of the alphabet");
});

test("hypergraph", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.hypergraph).toBeDefined();
    expect(schematic.hypergraph.hyperedges.length).toEqual(1);
});

test("add text", async () => {
    const schematic = new GeneralSchematics("Hello");
    schematic.add("World");
    expect(schematic.export()).toEqual("Hello\n\nWorld");
});


test("add hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");

    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);

    schematic.add(["D", "E", "F"]);
    expect(schematic.hyperedges).toEqual([["A", "B", "C"], ["D", "E", "F"]]);
    expect(schematic.export()).toEqual("A -> B -> C\n\nD -> E -> F");

    const exported = schematic.export();
    expect(exported).toEqual("A -> B -> C\n\nD -> E -> F");

    const schematic2 = new GeneralSchematics(exported);
    expect(schematic2.export()).toEqual("A -> B -> C\n\nD -> E -> F");

    expect(schematic.hypergraph.hash).toEqual(schematic2.hypergraph.hash);
});

test("skip header hypertext with no symbol", async () => {
    const schematic = new GeneralSchematics("# A\nThis is an a section");
    expect(schematic.hypertext.size).toEqual(0);
    expect(schematic.hyperedges).toEqual([]);
    expect(schematic.html).toEqual("<section><h1>A</h1><p>This is an a section</p></section>");
});

test("parse header hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n# A\nSection about the first letter of the alphabet");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);
    expect(schematic.hypertext.get("A").length).toEqual(1);
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
});

test("parse header multiple hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n# A\nSection about the first letter of the alphabet\n\nAlso associated with 1");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);
    expect(schematic.hypertext.get("A").length).toEqual(2);
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
    expect(schematic.hypertext.get("A")[1]).toEqual("Also associated with 1");
});

test("parse header hypertext with reference", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n# A\nSection about the first letter of the alphabet before B");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);
    expect(schematic.hypertext.get("A").length).toEqual(1);
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet before B");
    expect(schematic.hypertext.get("B").length).toEqual(1);
    expect(schematic.hypertext.get("B")[0]).toEqual("Section about the first letter of the alphabet before B");
});

test("export header hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n# A\nSection about the first letter of the alphabet");
    expect(schematic.export()).toEqual("A -> B -> C\n\n# A\n\nSection about the first letter of the alphabet");
});

test.skip("write hypertext for symbol", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const A = schematic.hypergraph.hyperedges[0].firstNode;
    schematic.addHypertext("A", "Section about the first letter of the alphabet");

    expect(schematic.hypertext.get("A").length).toEqual(1);
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
    expect(schematic.export()).toEqual("A -> B -> C\n\n# A\nSection about the first letter of the alphabet");
});

// TODO: write hypertext for symbol...existing section
// TODO: write multiple hypertext

// TODO: Check if header exists...otherwise..create


// TODO: Ideally we abstract this. We have ways to get directly to the part of the tree we want, and know how to do certain actions.



// How do we know how to write header sections?


// TODO: schematics should generate actions to be performed...keeps tree and hypergraph in sync and gives undo/redo for free
// TODO: soft break bug with single \n above -> doesn't translate back properly on export
// TODO: Reading node header sections
// TODO: Writing node header sections
// TODO: replace hypergraph.hash with GeneralSchematic.hash

// TODO: Uppercase/lowercase symbols...shouldn't matter?
// TODO: Keep order! This is going to get annoying to have all hyperedges at top and all hypertext on bottom
// TODO: Our parser right now is really dumb..we're gonna miss a lot of markdown elements cuz we're only getting text


// import...modify...export...import...check

// INTERWINGLE
// CONTEXTUAL HYPERTEXT (A -> B vs 1 -> B)