import Parser from "../src/common/lib/generalschematics/Parser.js"
import { expect, test } from "vitest";
// import WebBridge from "src/server/WebBridge"

test.only("parse simple doc", async () => {
    const parser = new Parser("hello world");
    expect(parser.lines.size).toBe(1);
    // expect(parser.arrayLines[0].line).toEqual("hello world");
    console.log(parser.arrayLines[0])
    // expect(parser.arrayLines[0].hypertext).toEqual("hello world");
    // expect(parser.output).toEqual("hello world");
    // expect(parser.hyperedges.length).toBe(0);
    // expect(parser.symbols.length).toBe(0);
    // console.log("BOOM", parser.hypertexts);
    // expect(parser.hypertexts.length).toBe(1);
});

test("parse multiline doc", async () => {
    const parser = new Parser("hello world\nand more");
    expect(parser.lines.size).toBe(2);
    expect(parser.arrayLines[0].line).toEqual("hello world");
    expect(parser.arrayLines[1].line).toEqual("and more");
    expect(parser.output).toEqual("hello world\nand more");
});

test.skip("parse same line twice", async () => {
    const parser = new Parser("hello world\nhello world");
    expect(parser.lines.size).toBe(2);
    expect(parser.arrayLines[0].line).toEqual("hello world");
    expect(parser.arrayLines[1].line).toEqual("and more");
    expect(parser.output).toEqual("hello world\nand more");
});

test.skip("parse hyperedge", async () => {
    const parser = new Parser("A -> B -> C");
    const hyperedge = parser.hyperedges[0];
    console.log(hyperedge);
});

// Do two lines with same value get cached to same thing? I think so.......
// modify hypertext with action


/*
test.only("parse hyperedge", async () => {
    const parser = new Parser();
    const lines = parser.parse("A -> B -> C");
    expect(lines.size).toBe(1);
    expect(parser.arrayLines[0].line).toEqual("A -> B -> C");
    expect(parser.hyperedges.length).toBe(1);

    expect(parser.symbols.length).toBe(3);
    expect(parser.symbols).toEqual(["A", "B", "C"]);

    expect(parser.output).toEqual("A -> B -> C");


    const hyperedge = parser.hyperedges[0];
    expect(hyperedge.symbols).toEqual(["A", "B", "C"]);
    expect(hyperedge.uuid).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
});

test("skip reparsing", async () => {
    const doc = "This is a doc\nA -> B -> C\nIt's got some hypertext for A.\n1 -> 2 -> 3\nAnd some Memex associations in it";
    const parser = new Parser();
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
        parser.parse(doc);
    }
    const elapsed = Date.now() - start;
    console.log(elapsed);
});

test("line uuid", async () => {
    const parser = new Parser();
    const lines = parser.parse("This is a line\nAnd another line");
    expect(lines.size).toBe(2);
    expect(parser.arrayLines[0].uuid).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
    expect(parser.arrayLines[1].uuid).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
    expect(parser.arrayLines[0].uuid).not.toBe(parser.arrayLines[1].uuid);
});

test("skips reparsing same line", async () => {
    const parser = new Parser();
    parser.parse("This is a line\nAnd another line");
    const uuids = parser.arrayLines.map(line => line.uuid);

    parser.parse("This is a line\nAnd another line\nAnd a new one");
    const nuuids = parser.arrayLines.map(line => line.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[2]).not.toBe(uuids[2]);
});
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

