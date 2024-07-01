import Tree from "@generalschematics/Tree"
const { Hypertext, EmptyLine, Header } = Tree;

import { expect, test } from "vitest";

test("parse simple doc", async () => {
    const tree = Tree.parse("hello world");
    expect(tree.lines.length).toBe(1);
    expect(tree.lines[0].line).toEqual("hello world");
    expect(tree.lines[0].hypertext).toEqual("hello world");
    expect(tree.output).toEqual("hello world");
    expect(tree.hyperedges.length).toBe(0);
    expect(tree.symbols.length).toBe(0);
    expect(tree.hypertexts.all.length).toBe(1);
    expect(tree.hypertexts.all[0].hypertext).toBe("hello world");
});

test("parse multiline doc", async () => {
    const tree = Tree.parse("hello world\nand more");
    expect(tree.lines.length).toBe(2);
    expect(tree.lines[0].line).toEqual("hello world");
    expect(tree.lines[1].line).toEqual("and more");
    expect(tree.lines[0]).toBeInstanceOf(Hypertext);
    expect(tree.lines[1]).toBeInstanceOf(Hypertext);
    expect(tree.output).toEqual("hello world\nand more");
});

test("parse same line twice", async () => {
    const tree = Tree.parse("hello world\nhello world");
    expect(tree.lines.length).toBe(2);
    expect(tree.lines[0].line).toEqual("hello world");
    expect(tree.lines[1].line).toEqual("hello world");
    expect(tree.output).toEqual("hello world\nhello world");
    expect(tree.hypertexts.all[0].uuid).not.toBe(tree.hypertexts.all[1].uuid);

    const uuids = tree.hypertexts.all.map(h => h.uuid);
    tree.parse("hello world\nhello world");
    const nuuids = tree.hypertexts.all.map(h => h.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[0]).not.toBe(nuuids[1]);
});

test("parse hyperedge", async () => {
    const tree = Tree.parse("A -> B -> C");
    expect(tree.lines.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.symbols.length).toBe(3);
    expect(tree.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
});

test("skips reparsing same line", async () => {
    const tree = Tree.parse();
    tree.parse("This is a line\nAnd another line");
    const uuids = tree.lines.map(line => line.uuid);

    tree.parse("This is a line\nAnd another line\nAnd a new one");
    const nuuids = tree.lines.map(line => line.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[2]).not.toBe(uuids[2]);
});

test("finds existing node with prepend", async () => {
    const tree = Tree.parse();
    tree.parse("This is an existing line");
    const uuids = tree.lines.map(line => line.uuid);

    tree.parse("This is a new line\nThis is an existing line");
    const nuuids = tree.lines.map(line => line.uuid);

    expect(nuuids[0]).not.toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[0]);
    expect(nuuids[0]).not.toBe(nuuids[1]);
});

test("consistent node uuids", async () => {
    const tree = Tree.parse("A -> B -> C");
    expect(tree.nodes.length).toBe(3);
    const [A, B, C] = tree.nodes;
    expect(A.symbol).toBe("A");
    expect(B.symbol).toBe("B");
    expect(C.symbol).toBe("C");

    expect(tree.hyperedges[0].uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    expect(A.uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    expect(B.uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    expect(C.uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);

    expect(A.uuid).not.toBe(B.uuid);

    const uuids = tree.nodes.map(node => node.uuid);
    tree.parse("A -> B -> C");
    const nuuids = tree.nodes.map(node => node.uuid);

    expect(nuuids[0]).toBe(uuids[0]);
    expect(nuuids[1]).toBe(uuids[1]);
    expect(nuuids[2]).toBe(uuids[2]);
});

test("modify hypertext", async () => {
    const tree = Tree.parse("Hello World");
    const hypertext = tree.hypertexts.all[0];
    expect(hypertext.hypertext).toBe("Hello World");
    hypertext.hypertext = "Hello!";
    expect(tree.output).toBe("Hello!");
});

test("modify node", async () => {
    const tree = Tree.parse("A -> B -> C");
    expect(tree.output).toBe("A → B → C");

    const [A, B, C] = tree.nodes;
    A.symbol = "A1";

    expect(tree.output).toBe("A1 → B → C");
});

test("remove hyperedge", async () => {
    const tree = Tree.parse("A -> B -> C");
    const hyperedge = tree.hyperedges[0];
    hyperedge.remove();
    expect(tree.lines.length).toBe(0);
    expect(tree.output).toBe("");
});

test("parse empty newline", async () => {
    const tree = Tree.parse("hello\n\nworld");
    expect(tree.lines.length).toBe(3);
    expect(tree.lines[0]).toBeInstanceOf(Hypertext);
    expect(tree.lines[1]).toBeInstanceOf(EmptyLine);
    expect(tree.lines[2]).toBeInstanceOf(Hypertext);
    expect(tree.hyperedges.length).toBe(0);
    expect(tree.symbols.length).toBe(0);
    expect(tree.output).toBe("hello\n\nworld");
});

test("parse header", async () => {
    const tree = Tree.parse("# Hello World");
    expect(tree.lines.length).toBe(1);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(1);
    expect(tree.headers.local.length).toBe(0);
    expect(tree.headers.all[0]).toBeInstanceOf(Header);
});

test("header owner", async () => {
    const tree = Tree.parse("A -> B -> C\n# A");
    expect(tree.lines.length).toBe(2);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
});

test("hypertext owned by header", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\nThis is some hypertext");
    expect(tree.lines.length).toBe(3);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.hypertexts.all.length).toBe(1);
    expect(tree.hypertexts.global.length).toBe(0);
    expect(tree.hypertexts.local.length).toBe(1);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.all[0].ownerSymbols).toEqual(["A"]);
});

test("assert index", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\nThis is some hypertext\nAnd some more");
    expect(tree.lines.length).toBe(4);
    expect(tree.lines[0].index).toBe(0);
    expect(tree.lines[1].index).toBe(1);
    expect(tree.lines[2].index).toBe(2);
    expect(tree.lines[3].index).toBe(3);
    expect(tree.hyperedges[0].index).toBe(0);
    expect(tree.headers.local[0].index).toBe(1);
    expect(tree.hypertexts.local[0].index).toBe(2);
});

test("should not match on characters", async () => {
    const tree = Tree.parse("A -> B -> C\nAwesome Global Hypertext");
    expect(tree.hypertexts.all.length).toBe(1);
    expect(tree.hypertexts.global.length).toBe(1);
    expect(tree.hypertexts.local.length).toBe(0);
});

test("multiple hypertext owned by header", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\nThis is some hypertext\nAnd some more");
    expect(tree.lines.length).toBe(4);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.hypertexts.all.length).toBe(2);
    expect(tree.hypertexts.global.length).toBe(0);
    expect(tree.hypertexts.local.length).toBe(2);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[1].ownerSymbols).toEqual(["A"]);
});

test("single break after header", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\n\nThis is some hypertext\nAnd some more");
    expect(tree.lines.length).toBe(5);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.hypertexts.all.length).toBe(2);
    expect(tree.hypertexts.global.length).toBe(0);
    expect(tree.hypertexts.local.length).toBe(2);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[1].ownerSymbols).toEqual(["A"]);
});

test("break between header hypertext", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\nThis is some hypertext\n\nAnd some more");
    expect(tree.lines.length).toBe(5);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.hypertexts.all.length).toBe(2);
    expect(tree.hypertexts.global.length).toBe(0);
    expect(tree.hypertexts.local.length).toBe(2);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[1].ownerSymbols).toEqual(["A"]);
});

test("double break out of header", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\nThis is some hypertext\n\n\nAnd some more");
    expect(tree.lines.length).toBe(6);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.hypertexts.all.length).toBe(2);
    expect(tree.hypertexts.global.length).toBe(1);
    expect(tree.hypertexts.local.length).toBe(1);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.global[0].ownerSymbols).toEqual([]);
});

test("hyperedge doesn't belong to header", async () => {
    const tree = Tree.parse("# A\nA -> B -> C\nThis is some hypertext\nThis one is for B too");
    expect(tree.lines.length).toBe(4);
    expect(tree.headers.all.length).toBe(1);
    expect(tree.headers.global.length).toBe(0);
    expect(tree.headers.local.length).toBe(1);
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.hypertexts.all.length).toBe(2);
    expect(tree.hypertexts.global.length).toBe(0);
    expect(tree.hypertexts.local.length).toBe(2);
    expect(tree.headers.all[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[0].ownerSymbols).toEqual(["A"]);
    expect(tree.hypertexts.local[1].ownerSymbols).toEqual(["A", "B"]);
});

test("hypertext that belongs to header", async () => {
    const tree = Tree.parse("A -> B -> C\n# A\nThis is some hypertext\nThis one is for B too");
    expect(tree.lines.length).toBe(4);

    const header = tree.headers.all[0];
    expect(header.children.length).toBe(2);
    header.children[0].remove();
    expect(tree.lines.length).toBe(3);

    expect(header.children.length).toBe(1);
    header.children[0].remove();
    expect(tree.lines.length).toBe(1);
});

test("remove entire header without hyperedge", async () => {
    const tree = Tree.parse("# A\nA -> B -> C\nThis is some hypertext\nThis one is for B too");
    expect(tree.lines.length).toBe(4);
    expect(tree.headers.all.length).toBe(1);
    const header = tree.headers.all[0];
    header.remove(true);

    expect(tree.lines.length).toBe(1);
    expect(tree.output).toBe("A → B → C");
});

test("find all", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.find().length).toBe(6);
    expect(tree.find({}).length).toBe(6);
});

test("find by type", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.find("hypertext").length).toBe(2);
    expect(tree.find("hyperedge").length).toBe(1);
    expect(tree.find("node").length).toBe(3);
});

test("find by property (uuid)", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.findOne({ uuid: tree.nodes[0].uuid }).symbol).toBe("A");
    expect(tree.findOne({ uuid: tree.nodes[1].uuid }).symbol).toBe("B");
    expect(tree.findOne({ uuid: tree.nodes[2].uuid }).symbol).toBe("C");
    expect(tree.findOne({ uuid: tree.hyperedges[0].uuid }).name).toBe("hyperedge");
});

test("find by property (hypertext)", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.findOne({ hypertext: "This hypertext belongs to A" }).name).toBe("hypertext");
});

test("find by function", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.find(node => node.symbol === "A").length).toBe(1);
    expect(tree.find(hyperedge => hyperedge.symbols && hyperedge.equals(["A", "B", "C"])).length).toBe(1);
});

test("find by owner", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.find(n => n.ownerSymbols && n.ownerSymbols.includes("A")).length).toBe(1);
    expect(tree.findOne(n => n.ownerSymbols && n.ownerSymbols.includes("A")).hypertext).toBe("This hypertext belongs to A");
});

test("add paragraph to header", async () => {
    const tree = Tree.parse("# This is a header\nThis is a paragraph\nThis is another paragraph");
    const header = tree.headers.all[0];
    expect(header.children.length).toBe(2);
    header.add("This is a new paragraph");
    expect(header.children.length).toBe(3);
    expect(tree.output).toBe("# This is a header\nThis is a paragraph\nThis is another paragraph\nThis is a new paragraph");
});

test("insert paragraph at index for header", async () => {
    const tree = Tree.parse("## This is a header\nThis is a paragraph\nThis is another paragraph");
    const header = tree.findOne("header");
    expect(header.children.length).toBe(2);
    header.insertAt(0, "1");
    expect(header.children.length).toBe(3);
    header.insertAt(2, "2");
    expect(header.children.length).toBe(4);
    expect(tree.output).toBe("## This is a header\n1\nThis is a paragraph\n2\nThis is another paragraph");
});

test("create header if doesn't exist", async () => {
    const tree = Tree.parse("");
    let header = tree.findOne("header");
    expect(header).toBe(null)

    header = tree.add("# This is a header");
    expect(header).toBeInstanceOf(Header);
    expect(tree.output).toBe("# This is a header");

    header.add("This is a paragraph");
    expect(tree.output).toBe("# This is a header\nThis is a paragraph");

    header = tree.findOne("header");
    expect(header).not.toBe(null)
});

test("walk all", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = tree.walk(obj => { return true });
    expect(matches.length).toBe(3);
});

test("walk none", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = tree.walk(obj => { return false });
    expect(matches.length).toBe(0);
});

test("walk until", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.walk(obj => { return obj.name !== "hyperedge" }).length).toBe(1);
    expect(tree.walk(obj => {
        return obj.owners && obj.owners.length == 0
    }).length).toBe(2);
});

test("walk back all", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = tree.walkBack(obj => { return true });
    expect(matches.length).toBe(3);
});

test("walk none", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    const matches = tree.walkBack(obj => { return false });
    expect(matches.length).toBe(0);
});

test("walk until", async () => {
    const tree = Tree.parse("This is some global hypertext\nA -> B -> C\nThis hypertext belongs to A");
    expect(tree.walkBack(obj => { return obj.name !== "hyperedge" }).length).toBe(1);
    expect(tree.walkBack(obj => {
        return obj.owners && obj.owners.length == 0
    }).length).toBe(0);
});

test("hashes", async () => {
    const tree = Tree.parse();
    expect(tree.text).toBe("");
    const { hash, edgehash, texthash } = tree;
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(edgehash).toBe("4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945");
    expect(texthash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

    tree.parse("A -> B -> C");
    expect(tree.text).toBe("");
    expect(tree.hash).not.toBe(hash);
    expect(tree.edgehash).not.toBe(edgehash);
    expect(tree.texthash).toBe(texthash)

    tree.parse("Hello World");

    expect(tree.text).toBe("Hello World");
    expect(tree.hash).not.toBe(hash);
    expect(tree.edgehash).toBe(edgehash);
    expect(tree.texthash).not.toBe(texthash)
});

test("consistent node uuid regression", async () => {
    const tree = Tree.parse("A -> ");
    const A1 = tree.nodes[0];
    tree.parse("A -> B");
    const A2 = tree.nodes[0];
    expect(A1.uuid).toBe(A2.uuid);

    tree.parse("A -> B -> C");
    const A3 = tree.nodes[0];
    expect(A2.uuid).toBe(A3.uuid);

});

test("consistent multi symbol node uuid regression", async () => {
    const tree = Tree.parse("A -> B -> C\nA -> 1 -> 2");
    const A1 = tree.nodes[0];
    const A2 = tree.nodes[3];
    expect(A1.uuid).not.toBe(A2.uuid);

    tree.parse("A -> B -> C \nA -> 1 -> 2 ");
    const A3 = tree.nodes[0];
    const A4 = tree.nodes[3];
    expect(A3.uuid).not.toBe(A4.uuid);

    expect(A1.uuid).toBe(A3.uuid);
    expect(A2.uuid).toBe(A4.uuid);
});

test("parse a single symbol", async () => {
    const tree = Tree.parse("A ->");
    expect(tree.hyperedges.length).toBe(1);
    expect(tree.nodes.length).toBe(2);
    expect(tree.html.includes("A")).toBe(true);
    expect(tree.html.includes("→")).toBe(true);
});

test("save symbol whitespace", async () => {
    const tree = Tree.parse("A -> B ");
    expect(tree.output).toBe("A → B ");

    tree.parse("A   ->   B    ")
    expect(tree.output).toBe("A   →   B    ");
});

test("single node edge", () => {
    const tree = Tree.parse();
    tree.add(["A"]);
    expect(tree.nodes.length).toBe(2);
    expect(tree.output).toBe("A →");
});

test("dont reuse different node uuids regression", () => {
    const tree = Tree.parse();
    tree.parse(`A -> B -> C\nA -`);
    tree.parse(`A -> B -> C\nA ->`);
    expect(tree.nodes[0].uuid).not.toBe(tree.nodes[3].uuid);
});



// TODO: send meta information to tree...so when events bubble up we know where they initiated from