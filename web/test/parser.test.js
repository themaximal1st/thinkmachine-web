import Parser from "@generalschematics/Parser.js"
const { Hypertext, Hyperedge, Node } = Parser;

import { expect, test } from "vitest";

test("parse simple doc", async () => {
    const parser = new Parser("hello world");
    expect(parser.lines.length).toBe(1);
    expect(parser.lines[0].line).toEqual("hello world");
    expect(parser.lines[0].hypertext).toEqual("hello world");
    expect(parser.output).toEqual("hello world");
    expect(parser.hyperedges.length).toBe(0);
    expect(parser.symbols.length).toBe(0);
    expect(parser.hypertexts.all.length).toBe(1);
    expect(parser.hypertexts.all[0].hypertext).toBe("hello world");
});

test("parse multiline doc", async () => {
    const parser = new Parser("hello world\nand more");
    expect(parser.lines.length).toBe(2);
    expect(parser.lines[0].line).toEqual("hello world");
    expect(parser.lines[1].line).toEqual("and more");
    expect(parser.lines[0]).toBeInstanceOf(Hypertext);
    expect(parser.lines[1]).toBeInstanceOf(Hypertext);
    expect(parser.output).toEqual("hello world\nand more");
});

test("parse same line twice", async () => {
    const parser = new Parser("hello world\nhello world");
    expect(parser.lines.length).toBe(2);
    expect(parser.lines[0].line).toEqual("hello world");
    expect(parser.lines[1].line).toEqual("hello world");
    expect(parser.output).toEqual("hello world\nhello world");
    expect(parser.hypertexts.all[0].uuid).not.toBe(parser.hypertexts.all[1].uuid);

    const uuids = parser.hypertexts.all.map(h => h.uuid);
    parser.parse("hello world\nhello world");
    const nuuids = parser.hypertexts.all.map(h => h.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[0]).not.toBe(nuuids[1]);
});

test("parse hyperedge", async () => {
    const parser = new Parser("A -> B -> C");
    expect(parser.lines.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.symbols.length).toBe(3);
    expect(parser.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
});

test("skips reparsing same line", async () => {
    const parser = new Parser();
    parser.parse("This is a line\nAnd another line");
    const uuids = parser.lines.map(line => line.uuid);

    parser.parse("This is a line\nAnd another line\nAnd a new one");
    const nuuids = parser.lines.map(line => line.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[2]).not.toBe(uuids[2]);
});

test("finds existing node with prepend", async () => {
    const parser = new Parser();
    parser.parse("This is an existing line");
    const uuids = parser.lines.map(line => line.uuid);

    parser.parse("This is a new line\nThis is an existing line");
    const nuuids = parser.lines.map(line => line.uuid);

    expect(nuuids[0]).not.toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[0]);
    expect(nuuids[0]).not.toBe(nuuids[1]);
});

test("consistent node uuids", async () => {
    const parser = new Parser("A -> B -> C");
    expect(parser.nodes.length).toBe(3);
    const [A, B, C] = parser.nodes;
    expect(A.symbol).toBe("A");
    expect(B.symbol).toBe("B");
    expect(C.symbol).toBe("C");

    expect(parser.hyperedges[0].uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    expect(A.uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    expect(B.uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    expect(C.uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);

    expect(A.uuid).not.toBe(B.uuid);

    const uuids = parser.nodes.map(node => node.uuid);
    parser.parse("A -> B -> C");
    const nuuids = parser.nodes.map(node => node.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[2]).toBe(uuids[2]);
});

test("modify hypertext", async () => {
    const parser = new Parser("Hello World");
    const hypertext = parser.hypertexts.all[0];
    expect(hypertext.hypertext).toBe("Hello World");
    hypertext.hypertext = "Hello!";
    expect(parser.output).toBe("Hello!");
});

test("modify node", async () => {
    const parser = new Parser("A -> B -> C");
    expect(parser.output).toBe("A -> B -> C");

    const [A, B, C] = parser.nodes;
    A.symbol = "A1";
    expect(parser.output).toBe("A1 -> B -> C");
});

test("remove hyperedge", async () => {
    const parser = new Parser("A -> B -> C");
    const hyperedge = parser.hyperedges[0];
    hyperedge.remove();
    expect(parser.lines.length).toBe(0);
    expect(parser.output).toBe("");
});



// DELETE




// TODO: very quickly we need to start building the hypergraph, and building up references + graphData!


/*

*/

// TODO: Add a node...other nodes should have same uuid...tricky because we need node caching, not just line caching


// EXPORT
// Tree -> Make parser parse into a tree
// DYNAMIC hyperedge collapse back down -> change node..modify hyperedge
// split updates into two sets...hypertext and hypergraph
// leave everything dynamic


// PARSER is the source of truth
// Every hyperedge inherits that uuid
// Every node gets a uuid
// Reparsing gets existing UUID!
// Node re-parsing gets existing UUID

// TODO: UPDATE ALL
// TODO: UPDATE LINE
// TODO: hypergraph ..hyperedges? ..built from parser?
// TODO: graphData ...graphData? ..built from parser?

// CORE IDEAS
// - parser input never changes except when explicitly changed by user
// - parsing is line by line
// - section parsing is punted until next time
// - no markdown formatting initially


// test high-level API — specifics are handled in other tests


// TODO: User adds a new line to hypertext -> returns new hypertext