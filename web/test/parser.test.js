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

test("hashes", async () => {
    const parser = new Parser();
    expect(parser.text).toBe("");
    const { hash, edgehash, texthash } = parser;
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(edgehash).toBe("4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945");
    expect(texthash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

    parser.parse("A -> B -> C");
    expect(parser.text).toBe("");
    expect(parser.hash).not.toBe(hash);
    expect(parser.edgehash).not.toBe(edgehash);
    expect(parser.texthash).toBe(texthash)

    parser.parse("Hello World");

    expect(parser.text).toBe("Hello World");
    expect(parser.hash).not.toBe(hash);
    expect(parser.edgehash).toBe(edgehash);
    expect(parser.texthash).not.toBe(texthash)
});

test("consistent node uuid regression", async () => {
    const parser = new Parser("A -> ");
    const A1 = parser.nodes[0];
    parser.parse("A -> B");
    const A2 = parser.nodes[0];
    expect(A1.uuid).toBe(A2.uuid);

    parser.parse("A -> B -> C");
    const A3 = parser.nodes[0];
    expect(A2.uuid).toBe(A3.uuid);

});

test("consistent multi symbol node uuid regression", async () => {
    const parser = new Parser("A -> B -> C\nA -> 1 -> 2");
    const A1 = parser.nodes[0];
    const A2 = parser.nodes[3];
    expect(A1.uuid).not.toBe(A2.uuid);

    parser.parse("A -> B -> C \nA -> 1 -> 2 ");
    const A3 = parser.nodes[0];
    const A4 = parser.nodes[3];
    expect(A3.uuid).not.toBe(A4.uuid);

    expect(A1.uuid).toBe(A3.uuid);
    expect(A2.uuid).toBe(A4.uuid);
});

test("parse a single symbol", async () => {
    const parser = new Parser("A ->");
    expect(parser.hyperedges.length).toBe(1);
    expect(parser.nodes.length).toBe(1);
});

test("save symbol whitespace", async () => {
    const parser = new Parser("A -> B ");
    expect(parser.output).toBe("A -> B ");

    parser.parse("A   ->   B    ")
    expect(parser.output).toBe("A   ->   B    ");
});

test("simple html", async () => {
    const parser = new Parser("Hello World");
    expect(parser.html).toBe("Hello World");
});

test.only("hyperlinked symbols", async () => {
    const parser = new Parser("A -> B -> C");
    expect(parser.html).toBe(`<div class="hyperedge"><a class="node">A </span>-><span class="node"> B </span>-><span class="node"> C</span></div>`);
});

// TODO: html should work on input..not output..keeps it consistent
// TODO: html should output current node/hyperedge colors

// TODO: Need html mode...that is very lightly wrapped content divs
// TODO: send meta information to parser...so when events bubble up we know where they initiated from