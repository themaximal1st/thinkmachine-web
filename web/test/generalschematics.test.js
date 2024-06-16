import GeneralSchematics from "@lib/generalschematics"

import { expect, test, beforeAll } from "vitest";

// test high-level API — specifics are handled in other tests

test("parse simple doc", async () => {
    const schematic = new GeneralSchematics("Hello World");
    await schematic.parse();
    expect(schematic.input).toEqual("Hello World");
    expect(schematic.html).toEqual("<p>Hello World</p>");
    expect(schematic.hyperedges).toEqual([]);
});

test("parse hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    await schematic.parse();
    expect(schematic.input).toEqual("A -> B -> C");
    expect(schematic.html).toEqual("<p>A -> B -> C</p>");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);
});

test("parse hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nA is the first letter of the alphabet");
    await schematic.parse();
    expect(schematic.html).toEqual("<p>A -> B -> C<br>\nA is the first letter of the alphabet</p>");
    expect(schematic.hyperedges).toEqual([["A", "B", "C"]]);

    const hypertext = schematic.hypertext.get("A");
    expect(hypertext.length).toEqual(1);
    expect(hypertext[0]).toEqual("A is the first letter of the alphabet");
});

test("parse multiple hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nA is the first letter of the alphabet while B is the second.\nA is also usually associated with numeric value 1");
    await schematic.parse();
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
    await schematic.parse();

    const doc = schematic.export();
    expect(doc).toEqual("hello world");
});

test("simple hyperedge export", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    await schematic.parse();

    const doc = schematic.export();
    expect(doc).toEqual("A -> B -> C");
});

test("simple hypertext export", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nA is the first letter of the alphabet");
    await schematic.parse();

    const doc = schematic.export();
    expect(doc).toEqual("A -> B -> C\nA is the first letter of the alphabet");
});

test("hypergraph", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    await schematic.parse();
    expect(schematic.hypergraph).toBeDefined();
    expect(schematic.hypergraph.hyperedges.length).toEqual(1);
});

test("add hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    await schematic.parse();

    const hypergraph = schematic.hypergraph;
    hypergraph.add(["D", "E", "F"]);
    expect(hypergraph.export()).toEqual("A -> B -> C\nD -> E -> F");

    const exported = schematic.export();
    expect(exported).toEqual("A -> B -> C\nD -> E -> F");

    const schematic2 = new GeneralSchematics(exported);
    await schematic2.parse();
    expect(schematic2.hypergraph.export()).toEqual("A -> B -> C\nD -> E -> F");
    expect(hypergraph.hash).toEqual(schematic2.hypergraph.hash);
});


// TODO: Keep order! This is going to get annoying to have all hyperedges at top and all hypertext on bottom

// import...modify...export...import...check

// INTERWINGLE
// CONTEXTUAL HYPERTEXT (A -> B vs 1 -> B)