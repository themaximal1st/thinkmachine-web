import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

// test high-level API — specifics are handled in other tests

test("parse simple doc", async () => {
    const schematic = new GeneralSchematics("Hello World");
    expect(schematic.input).toEqual("Hello World");
    expect(schematic.hyperedges).toEqual([]);
    expect(schematic.symbols).toEqual([]);
});

test("parse and export hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.input).toEqual("A -> B -> C");
    const tree = schematic.tree;

    expect(tree.length).toEqual(1);
    expect(tree.hypertexts.all.length).toEqual(0);
    expect(tree.hyperedges.length).toEqual(1);
    expect(tree.hyperedges[0].length).toEqual(3);

    const [A, B, C] = tree.hyperedges[0].nodes;
    expect(A.symbol).toEqual("A");
    expect(B.symbol).toEqual("B");
    expect(C.symbol).toEqual("C");

    expect(schematic.output).toEqual("A -> B -> C");
    expect(schematic.hyperedges.length).toEqual(1);
    expect(schematic.nodes.length).toEqual(3);
    expect(schematic.symbols).toEqual(["A", "B", "C"]);
});

test("multiple hyperedges", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n1 -> 2 -> 3");
    const hyperedges = schematic.hyperedges;
    expect(hyperedges.length).toEqual(2);

    expect(hyperedges[0].nodes.length).toEqual(3);
    expect(hyperedges[0].nodes[0].symbol).toEqual("A");
    expect(hyperedges[0].nodes[1].symbol).toEqual("B");
    expect(hyperedges[0].nodes[2].symbol).toEqual("C");
    expect(hyperedges[1].nodes.length).toEqual(3);
    expect(hyperedges[1].nodes[0].symbol).toEqual("1");
    expect(hyperedges[1].nodes[1].symbol).toEqual("2");
    expect(hyperedges[1].nodes[2].symbol).toEqual("3");

    expect(schematic.output).toEqual("A -> B -> C\n1 -> 2 -> 3");
});

test("soft breaks", async () => {
    const schematic = new GeneralSchematics("Hello\nWorld");
    expect(schematic.input).toEqual("Hello\nWorld");
    expect(schematic.hyperedges).toEqual([]);
    expect(schematic.output).toEqual("Hello\nWorld");
});

test("custom node object", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const edge = schematic.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.rename("A1");
    B.rename("B1");
    C.rename("C1");

    expect(schematic.output).toEqual("A1 -> B1 -> C1");
    expect(schematic.hyperedges[0].nodes[0].symbol).toEqual("A1");
});

test("add node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    C.add("D");
    expect(schematic.output).toEqual("A -> B -> C -> D");

    A.add("A1");
    expect(schematic.output).toEqual("A -> A1 -> B -> C -> D");
});

test("insert node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    C.insert("D");
    expect(schematic.output).toEqual("A -> B -> D -> C");

    A.insert("A1");
    expect(schematic.output).toEqual("A1 -> A -> B -> D -> C");
});

test("remove node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    B.remove();
    expect(schematic.output).toEqual("A -> C");

    A.remove();
    expect(schematic.output).toEqual("C");
});

test("node UUID", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    expect(A.uuid).toBeDefined();
    expect(A.uuid).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
});

test("add hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const edge = schematic.add(["D", "E", "F"]);
    expect(edge.index).toEqual(1);
    const [D, E, F] = edge.nodes;
    expect(D.symbol).toEqual("D");
    expect(E.symbol).toEqual("E");
    expect(F.symbol).toEqual("F");
    expect(schematic.output).toEqual("A -> B -> C\nD -> E -> F");
    expect(schematic.hyperedges.length).toEqual(2);
});

test("remove hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nD -> E -> F");
    const [ABC, DEF] = schematic.hyperedges;
    expect(ABC.index).toEqual(0);
    expect(DEF.index).toEqual(1);
    ABC.remove();
    expect(schematic.hyperedges.length).toEqual(1);
    expect(schematic.output).toEqual("D -> E -> F");

    DEF.remove();
    expect(schematic.hyperedges.length).toEqual(0);
    expect(schematic.output).toEqual("");
});

test("hypertextify global and local hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nThis is global hypertext.\n\n# A\nThis is local hypertext for A");

    const hypertexts = schematic.hypertexts.all;
    expect(hypertexts.length).toEqual(2);

    const global = schematic.hypertexts.global;
    expect(global.length).toEqual(1);
    expect(global[0].hypertext).toEqual("This is global hypertext.");
    expect(global[0].owners).toEqual([]);

    const local = schematic.hypertexts.get("A");
    expect(local.length).toEqual(1);
    expect(local[0].hypertext).toEqual("This is local hypertext for A");
    expect(local[0].ownerSymbols).toEqual(["A"]);
});

test("modify global hypertext", async () => {
    const schematic = new GeneralSchematics("This is global hypertext");
    expect(schematic.hypertexts.all.length).toEqual(1);
    expect(schematic.hypertexts.local.length).toEqual(0);
    expect(schematic.hypertexts.global.length).toEqual(1);
    const [hypertext] = schematic.hypertexts.global;
    hypertext.hypertext = "This is new global hypertext";
    expect(hypertext.owners).toEqual([]);
    expect(schematic.output).toEqual("This is new global hypertext");
});

test("remove global hypertext", async () => {
    const schematic = new GeneralSchematics("This is global hypertext");
    const [hypertext] = schematic.hypertexts.global;
    hypertext.remove();
    expect(schematic.output).toEqual("");
});

test("add non-local hypertext", async () => {
    const schematic = new GeneralSchematics("## A\nThis is global hypertext because A doesn't exist.");
    expect(schematic.hypertexts.global.length).toEqual(1);
    const [hypertext] = schematic.hypertexts.global;
    expect(hypertext.owners).toEqual([]);
    expect(hypertext.hypertext).toEqual("This is global hypertext because A doesn't exist.");

    expect(schematic.hypertexts.get("A").length).toEqual(0);
});

test("tokenize symbol with period regression", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nThis is some hypertext for A.");
    expect(schematic.hypertexts.all.length).toEqual(1);
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.local.length).toEqual(1);
    const hypertexts = schematic.hypertexts.get("A");
    expect(hypertexts.length).toEqual(1);
    expect(hypertexts[0].hypertext).toEqual("This is some hypertext for A.");
});

test("reclassify hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nThis is some hypertext for A.");
    const [A, _] = schematic.hyperedges[0].nodes;

    expect(A.hypertexts.length).toEqual(1);
    const hypertext = A.hypertexts[0];
    expect(hypertext.hypertext).toEqual("This is some hypertext for A.");

    hypertext.hypertext = "New hypertext";
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.hypertexts.global.length).toEqual(1);

    hypertext.hypertext = "New hypertext for A";
    expect(A.hypertexts.length).toEqual(1);
    expect(schematic.hypertexts.global.length).toEqual(0);
});

test("simple hypertext attaches to two symbols", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nThis is attached to A and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(A.hypertexts.length).toEqual(1);
    expect(A.hypertexts[0].hypertext).toEqual("This is attached to A and B");
    expect(B.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].hypertext).toEqual("This is attached to A and B");
    expect(B.hypertexts[0].ownerSymbols).toEqual(["A", "B"]);
    B.hypertexts[0].hypertext = "This is attached to B";
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.output).toEqual("A -> B -> C\nThis is attached to B");
});

test("complex hypertext attaches to two symbols", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\n## A\nThis is attached to header and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].ownerSymbols).toEqual(["A", "B"]);

    const hypertext = B.hypertexts[0];
    hypertext.remove();
    expect(B.hypertexts.length).toEqual(0);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.output).toEqual("A -> B -> C\n");
});

test("add global symbol hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.lines.length).toEqual(1);
    schematic.hypertexts.add("C", "This is some hypertext");
    expect(schematic.lines.length).toEqual(3);
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.local.length).toEqual(1);
    schematic.hypertexts.add("C", "Here is some more");
    expect(schematic.lines.length).toEqual(4);
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.local.length).toEqual(2);
    expect(schematic.output).toEqual("A -> B -> C\n# C\nThis is some hypertext\nHere is some more");
});

test("add symbol hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(A.hypertexts.length).toEqual(0);
    A.hypertext.add("This is some hypertext for A");

    expect(A.hypertexts.length).toEqual(1);
    expect(A.hypertexts[0].hypertext).toEqual("This is some hypertext for A");
    A.hypertexts[0].hypertext = "New hypertext for B";

    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(1);
    expect(schematic.output).toEqual("A -> B -> C\n# A\nNew hypertext for B");
});

test("modifying hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const hypertext = schematic.hypertexts.add("This is some global hypertext");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    expect(hypertext.owners).toEqual([]);
    expect(hypertext.hypertext).toEqual("This is some global hypertext");

    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(0);
    expect(C.hypertexts.length).toEqual(0);

    hypertext.hypertext = "This is some global hypertext with A"
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(0);
    expect(C.hypertexts.length).toEqual(0);

    hypertext.hypertext = "This is some global hypertext with A, B"
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(1);
    expect(C.hypertexts.length).toEqual(0);

    hypertext.hypertext = "This is some global hypertext with A, B, C"
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(1);
    expect(C.hypertexts.length).toEqual(1);

    hypertext.hypertext = "This is some global hypertext with B, C"
    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(1);
    expect(C.hypertexts.length).toEqual(1);

    hypertext.remove();
    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(0);
    expect(C.hypertexts.length).toEqual(0);
});

test("initializes empty", async () => {
    const schematic = new GeneralSchematics();
    expect(schematic.output).toEqual("");
    expect(schematic.hyperedges.length).toEqual(0);
    expect(schematic.hypertexts.all.length).toEqual(0);
    expect(schematic.lines.length).toEqual(0);
});

test("add global hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertexts.add("This is some hypertext")
    expect(schematic.output).toEqual("This is some hypertext");
    expect(schematic.hypertexts.global.length).toEqual(1);
});

test("add node hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertexts.add("A", "This is some hypertext")

    expect(schematic.output).toEqual("# A\nThis is some hypertext");

    schematic.hypertexts.add("A", "This is some more hypertext")
    expect(schematic.output).toEqual("# A\nThis is some hypertext\nThis is some more hypertext");
});

test("adding node localized hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertexts.add("A", "This is some hypertext")
    expect(schematic.hypertexts.all[0].header).not.toBe(null);
    expect(schematic.hypertexts.all[0].header.header).toBe("A");
    expect(schematic.lines.length).toBe(2);

    schematic.hypertexts.add("This is some global hypertext");
    expect(schematic.hypertexts.all[1].header).toBe(null);
    expect(schematic.lines.length).toBe(5);

    expect(schematic.hypertexts.all.length).toEqual(2);
    expect(schematic.hypertexts.global.length).toEqual(2);
    expect(schematic.hypertexts.local.length).toEqual(0);

    schematic.add(["A", "B", "C"]);
    expect(schematic.hypertexts.all.length).toEqual(2);
    expect(schematic.hypertexts.global.length).toEqual(1);
    expect(schematic.hypertexts.local.length).toEqual(1);

    expect(schematic.hypertexts.global.length).toEqual(1);
    expect(schematic.hypertexts.get("A").length).toEqual(1);

});

test("hyperedges before hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n## A\nThis is attached to header and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].ownerSymbols).toEqual(["A", "B"]);

    const hypertext = B.hypertexts[0];
    hypertext.remove();
    expect(B.hypertexts.length).toEqual(0);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.output).toEqual("A -> B -> C");
});

test("leaves hypertext header if multiple", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n## A\nThis is attached to header and B\nAnd some more");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(2);
    expect(B.hypertexts[0].ownerSymbols).toEqual(["A", "B"]);

    const hypertext = B.hypertexts[0];
    hypertext.remove();
    expect(B.hypertexts.length).toEqual(0);
    expect(A.hypertexts.length).toEqual(1);
    expect(schematic.output).toEqual("A -> B -> C\n## A\nAnd some more");
});

test("hyperedges after hypertext", async () => {
    const schematic = new GeneralSchematics("## A\nThis is some hypertext\nAnd more.\n\nA -> B -> C");
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.get("A").length).toEqual(2);
});

test("hashes equal", async () => {
    const schematic1 = new GeneralSchematics("A -> B -> C\n\nThis is some hypertext");
    const schematic2 = new GeneralSchematics("A -> B -> C\n\nThis is some hypertext");
    expect(schematic1.hash).not.toBe(schematic2.hash);
    schematic2.hyperedges[0].uuid = schematic1.hyperedges[0].uuid;
    schematic2.nodes[0].uuid = schematic1.nodes[0].uuid;
    schematic2.nodes[1].uuid = schematic1.nodes[1].uuid;
    schematic2.nodes[2].uuid = schematic1.nodes[2].uuid;
    expect(schematic1.hash).not.toEqual(schematic2.hash);
    schematic2.hypertexts.global[0].uuid = schematic1.hypertexts.global[0].uuid;
    expect(schematic1.hash).toEqual(schematic2.hash);
});

test("hypertext import modify export import", async () => {
    const schematic = new GeneralSchematics("## A\nThis is some hypertext with B\nAnd more for C.\n\nA -> B -> C");
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.get("A").length).toEqual(2);
    expect(schematic.hypertexts.get("B").length).toEqual(1);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.hypertexts.get("B")[0].hypertext = "Modified with B";
    schematic.hypertexts.get("C")[0].hypertext = "Modified with C";
    expect(schematic.hypertexts.get("A").length).toEqual(2);
    expect(schematic.hypertexts.get("B").length).toEqual(1);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    const exported = schematic.output;
    expect(exported).toEqual("## A\nModified with B\nModified with C\n\nA -> B -> C");

    const schematic2 = new GeneralSchematics(exported);
    expect(schematic2.hypertexts.get("A").length).toEqual(2);
    expect(schematic2.hypertexts.get("B").length).toEqual(1);
    expect(schematic2.hypertexts.get("C").length).toEqual(1);
    expect(schematic2.hypertexts.get("A")[0].hypertext).toEqual("Modified with B");
    expect(schematic2.hypertexts.get("A")[1].hypertext).toEqual("Modified with C");
});


test("parse keeps uuids", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const uuids = schematic.hyperedges[0].nodes.map(node => node.uuid);
    const edgeUUID = schematic.hyperedges[0].uuid;
    expect(uuids.length).toEqual(3);

    schematic.parse("A -> B -> C");
    const nuuids = schematic.hyperedges[0].nodes.map(node => node.uuid);
    expect(nuuids).toEqual(uuids);
    expect(schematic.hyperedges[0].uuid).toEqual(edgeUUID);
});

test("parse keeps uuids multiple symbols", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nA -> 1 -> 2");

    expect(schematic.nodes.length).toEqual(6);
    const uids = schematic.nodes.map(node => node.uid);
    const uuids = schematic.nodes.map(node => node.uuid);

    schematic.parse("A -> B -> C\nA -> 1 -> 2");
    const nuuids = schematic.nodes.map(node => node.uuid);
    const nuids = schematic.nodes.map(node => node.uid);

    expect(nuids).toEqual(uids);
    expect(nuuids).toEqual(uuids);
});

test("symbols with spaces", async () => {
    const schematic = new GeneralSchematics("This is A -> This is B -> This is C");
    expect(schematic.hyperedges.length).toEqual(1);
    expect(schematic.nodes.length).toEqual(3);
    expect(schematic.nodes[0].symbol).toEqual("This is A");
    expect(schematic.nodes[1].symbol).toEqual("This is B");
    expect(schematic.nodes[2].symbol).toEqual("This is C");
    expect(schematic.output).toEqual("This is A -> This is B -> This is C");
});

// TODO: Add hypertext in different contexts
//     1 -> B
//     A -> B
//     # B
//     stuff
//
//     # 1 -> B
//     stuff

// TODO: Uppercase/lowercase symbols...shouldn't matter?
// TODO: schematics should generate actions to be performed...keeps tree and hypergraph in sync and gives undo/redo for free
// TODO: CONTEXTUAL HYPERTEXT (A -> B vs 1 -> B)
// TODO: Our parser right now is really dumb..we're gonna miss a lot of markdown elements cuz we're only getting text. Right now it's a subset. it should be a superset
// INTERWINGLE
// TODO: There's a bug...when you set a hypertext..it should check if it is going to lose its reference. It's not clear what we should do...text might jump around