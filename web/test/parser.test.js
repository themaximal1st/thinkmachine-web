import Parser from "@generalschematics/Parser.js"
const { Hypertext, Hyperedge, Node, EmptyLine, Header } = Parser;

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

test("parse empty newline", async () => {
    const parser = new Parser("hello\n\nworld");
    expect(parser.lines.length).toBe(3);
    expect(parser.lines[0]).toBeInstanceOf(Hypertext);
    expect(parser.lines[1]).toBeInstanceOf(EmptyLine);
    expect(parser.lines[2]).toBeInstanceOf(Hypertext);
    expect(parser.hyperedges.length).toBe(0);
    expect(parser.symbols.length).toBe(0);
    expect(parser.output).toBe("hello\n\nworld");
});

test("parse header", async () => {
    const parser = new Parser("# Hello World");
    expect(parser.lines.length).toBe(1);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(1);
    expect(parser.headers.local.length).toBe(0);
    expect(parser.headers.all[0]).toBeInstanceOf(Header);
});

test("header owner", async () => {
    const parser = new Parser("A -> B -> C\n# A");
    expect(parser.lines.length).toBe(2);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
});

test("hypertext owned by header", async () => {
    const parser = new Parser("A -> B -> C\n# A\nThis is some hypertext");
    expect(parser.lines.length).toBe(3);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.hypertexts.all.length).toBe(1);
    expect(parser.hypertexts.global.length).toBe(0);
    expect(parser.hypertexts.local.length).toBe(1);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.all[0].ownerSymbols).toEqual(["A"]);
});

test("assert index", async () => {
    const parser = new Parser("A -> B -> C\n# A\nThis is some hypertext\nAnd some more");
    expect(parser.lines.length).toBe(4);
    expect(parser.lines[0].index).toBe(0);
    expect(parser.lines[1].index).toBe(1);
    expect(parser.lines[2].index).toBe(2);
    expect(parser.lines[3].index).toBe(3);
    expect(parser.hyperedges[0].index).toBe(0);
    expect(parser.headers.local[0].index).toBe(1);
    expect(parser.hypertexts.local[0].index).toBe(2);
    // TODO
    // expect(parser.hypertexts.local[1].index).toBe(3);
});

test("should not match on characters", async () => {
    const parser = new Parser("A -> B -> C\nAwesome Global Hypertext");
    expect(parser.hypertexts.all.length).toBe(1);
    expect(parser.hypertexts.global.length).toBe(1);
    expect(parser.hypertexts.local.length).toBe(0);
});

test("multiple hypertext owned by header", async () => {
    const parser = new Parser("A -> B -> C\n# A\nThis is some hypertext\nAnd some more");
    expect(parser.lines.length).toBe(4);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.hypertexts.all.length).toBe(2);
    expect(parser.hypertexts.global.length).toBe(0);
    expect(parser.hypertexts.local.length).toBe(2);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[1].ownerSymbols).toEqual(["A"]);
});

test("single break after header", async () => {
    const parser = new Parser("A -> B -> C\n# A\n\nThis is some hypertext\nAnd some more");
    expect(parser.lines.length).toBe(5);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.hypertexts.all.length).toBe(2);
    expect(parser.hypertexts.global.length).toBe(0);
    expect(parser.hypertexts.local.length).toBe(2);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[1].ownerSymbols).toEqual(["A"]);
});

test("break between header hypertext", async () => {
    const parser = new Parser("A -> B -> C\n# A\nThis is some hypertext\n\nAnd some more");
    expect(parser.lines.length).toBe(5);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.hypertexts.all.length).toBe(2);
    expect(parser.hypertexts.global.length).toBe(0);
    expect(parser.hypertexts.local.length).toBe(2);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[1].ownerSymbols).toEqual(["A"]);
});

test("double break out of header", async () => {
    const parser = new Parser("A -> B -> C\n# A\nThis is some hypertext\n\n\nAnd some more");
    expect(parser.lines.length).toBe(6);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.hypertexts.all.length).toBe(2);
    expect(parser.hypertexts.global.length).toBe(1);
    expect(parser.hypertexts.local.length).toBe(1);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.global[0].ownerSymbols).toEqual([]);
});

test("hyperedge doesn't belong to header", async () => {
    const parser = new Parser("# A\nA -> B -> C\nThis is some hypertext\nThis one is for B too");
    expect(parser.lines.length).toBe(4);
    expect(parser.headers.all.length).toBe(1);
    expect(parser.headers.global.length).toBe(0);
    expect(parser.headers.local.length).toBe(1);
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.hypertexts.all.length).toBe(2);
    expect(parser.hypertexts.global.length).toBe(0);
    expect(parser.hypertexts.local.length).toBe(2);
    expect(parser.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(parser.hypertexts.local[1].ownerSymbols).toEqual(["A", "B"]);
});

test("hypertext that belongs to header", async () => {
    const parser = new Parser("A -> B -> C\n# A\nThis is some hypertext\nThis one is for B too");
    expect(parser.lines.length).toBe(4);

    const header = parser.headers.all[0];
    expect(header.children.length).toBe(2);
    header.children[0].remove();
    expect(parser.lines.length).toBe(3);

    expect(header.children.length).toBe(1);
    header.children[0].remove();
    expect(header.children.length).toBe(0);
    expect(parser.lines.length).toBe(2);

    header.remove();
    expect(parser.lines.length).toBe(1);
});

test("remove entire header without hyperedge", async () => {
    const parser = new Parser("# A\nA -> B -> C\nThis is some hypertext\nThis one is for B too");
    expect(parser.lines.length).toBe(4);
    expect(parser.headers.all.length).toBe(1);
    const header = parser.headers.all[0];
    header.remove(true);

    expect(parser.lines.length).toBe(1);
    expect(parser.output).toBe("A -> B -> C");
});

test("find all", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.find().length).toBe(6);
    expect(parser.find({}).length).toBe(6);
});

test("find by type", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.find("hypertext").length).toBe(2);
    expect(parser.find("hyperedge").length).toBe(1);
    expect(parser.find("node").length).toBe(3);
});

test("find by property (uuid)", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.findOne({ uuid: parser.nodes[0].uuid }).symbol).toBe("A");
    expect(parser.findOne({ uuid: parser.nodes[1].uuid }).symbol).toBe("B");
    expect(parser.findOne({ uuid: parser.nodes[2].uuid }).symbol).toBe("C");
    expect(parser.findOne({ uuid: parser.hyperedges[0].uuid }).name).toBe("hyperedge");
});

test("find by property (hypertext)", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.findOne({ hypertext: "This hypertext belongs to A" }).name).toBe("hypertext");
});

test("find by function", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.find(node => node.symbol === "A").length).toBe(1);
    expect(parser.find(hyperedge => hyperedge.symbols && hyperedge.equals(["A", "B", "C"])).length).toBe(1);
});

test("find by owner", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.find(n => n.ownerSymbols && n.ownerSymbols.includes("A")).length).toBe(1);
    expect(parser.findOne(n => n.ownerSymbols && n.ownerSymbols.includes("A")).hypertext).toBe("This hypertext belongs to A");
});

test("add paragraph to header", async () => {
    const parser = new Parser("# This is a header\nThis is a paragraph\nThis is another paragraph");
    const header = parser.headers.all[0];
    expect(header.children.length).toBe(2);
    header.add("This is a new paragraph");
    expect(header.children.length).toBe(3);
    expect(parser.output).toBe("# This is a header\nThis is a paragraph\nThis is another paragraph\nThis is a new paragraph");
});

test("insert paragraph at index for header", async () => {
    const parser = new Parser("## This is a header\nThis is a paragraph\nThis is another paragraph");
    const header = parser.findOne("header");
    expect(header.children.length).toBe(2);
    header.insertAt(0, "1");
    expect(header.children.length).toBe(3);
    header.insertAt(2, "2");
    expect(header.children.length).toBe(4);
    expect(parser.output).toBe("## This is a header\n1\nThis is a paragraph\n2\nThis is another paragraph");
});

test("create header if doesn't exist", async () => {
    const parser = new Parser("");
    let header = parser.findOne("header");
    expect(header).toBe(null)

    header = parser.add("# This is a header");
    expect(header).toBeInstanceOf(Header);
    expect(parser.output).toBe("# This is a header");

    header.add("This is a paragraph");
    expect(parser.output).toBe("# This is a header\nThis is a paragraph");

    header = parser.findOne("header");
    expect(header).not.toBe(null)
});

test("walk all", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = parser.walk(obj => { return true });
    expect(matches.length).toBe(3);
});

test("walk none", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = parser.walk(obj => { return false });
    expect(matches.length).toBe(0);
});

test("walk until", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.walk(obj => { return obj.name !== "hyperedge" }).length).toBe(1);
    expect(parser.walk(obj => {
        return obj.owners && obj.owners.length == 0
    }).length).toBe(2);
});

test("walk back all", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = parser.walkBack(obj => { return true });
    expect(matches.length).toBe(3);
});

test("walk none", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = parser.walkBack(obj => { return false });
    expect(matches.length).toBe(0);
});

test("walk until", async () => {
    const parser = new Parser("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(parser.walkBack(obj => { return obj.name !== "hyperedge" }).length).toBe(1);
    expect(parser.walkBack(obj => {
        return obj.owners && obj.owners.length == 0
    }).length).toBe(0);
});

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

// We assume symbols cant belong to a header...maybe they could in the future?