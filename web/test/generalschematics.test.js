import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

// test high-level API — specifics are handled in other tests

test("parse simple doc", async () => {
    const schematic = new GeneralSchematics("Hello World");
    expect(schematic.input).toEqual("Hello World");
    expect(schematic.html).toEqual("<p>Hello World</p>");
    expect(schematic.hyperedges).toEqual([]);
    expect(schematic.export()).toEqual("Hello World");
});

test("parse and export hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.input).toEqual("A -> B -> C");
    const tree = schematic.tree;

    expect(tree.type).toEqual("root");
    expect(tree.children.length).toEqual(1);
    expect(tree.children[0].type).toEqual("paragraph");
    expect(tree.children[0].children.length).toEqual(1);

    const hyperedge = tree.children[0].children[0];
    expect(hyperedge.type).toEqual("hyperedge");
    expect(hyperedge.children.length).toEqual(3);

    const [A, B, C] = hyperedge.children;
    expect(A.type).toEqual("node");
    expect(A.value).toEqual("A");
    expect(B.type).toEqual("node");
    expect(B.value).toEqual("B");
    expect(C.type).toEqual("node");
    expect(C.value).toEqual("C");

    expect(schematic.export()).toEqual("A -> B -> C");
    expect(schematic.html).toEqual("<p>A -> B -> C</p>");
    // expect(schematic.hyperedges.length).toEqual(1);
    // expect(schematic.nodes).toEqual(["A", "B", "C"]);
});

test("multiple hyperedges", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n1 -> 2 -> 3");
    const hyperedges = schematic.hyperedges;
    expect(hyperedges.length).toEqual(2);

    expect(hyperedges[0].nodes.length).toEqual(3);
    expect(hyperedges[0].nodes[0].value).toEqual("A");
    expect(hyperedges[0].nodes[1].value).toEqual("B");
    expect(hyperedges[0].nodes[2].value).toEqual("C");
    expect(hyperedges[1].nodes.length).toEqual(3);
    expect(hyperedges[1].nodes[0].value).toEqual("1");
    expect(hyperedges[1].nodes[1].value).toEqual("2");
    expect(hyperedges[1].nodes[2].value).toEqual("3");

    expect(schematic.export()).toEqual("A -> B -> C\n1 -> 2 -> 3");
    expect(schematic.html).toEqual("<p>A -> B -> C<br>\n1 -> 2 -> 3</p>");
});

test("soft breaks", async () => {
    const schematic = new GeneralSchematics("Hello\nWorld");
    expect(schematic.input).toEqual("Hello\nWorld");
    expect(schematic.html).toEqual("<p>Hello<br>\nWorld</p>");
    expect(schematic.hyperedges).toEqual([]);
    expect(schematic.export()).toEqual("Hello\nWorld");
});

test("custom node object", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const edge = schematic.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.rename("A1");
    B.rename("B1");
    C.rename("C1");

    expect(schematic.export()).toEqual("A1 -> B1 -> C1");
    expect(schematic.hyperedges[0].nodes[0].value).toEqual("A1");

    expect(schematic.html).toEqual("<p>A1 -> B1 -> C1</p>");
});

test("add node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    C.add("D");
    expect(schematic.export()).toEqual("A -> B -> C -> D");

    A.add("A1");
    expect(schematic.export()).toEqual("A -> A1 -> B -> C -> D");
});

test("insert node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    C.insert("D");
    expect(schematic.export()).toEqual("A -> B -> D -> C");

    A.insert("A1");
    expect(schematic.export()).toEqual("A1 -> A -> B -> D -> C");
});

test("remove node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    B.remove();
    expect(schematic.export()).toEqual("A -> C");

    A.remove();
    expect(schematic.export()).toEqual("C");
});

test("node UUID", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    expect(A.uuid).toBeDefined();
    expect(A.uuid).toMatch(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/);
});

test("add hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const edge = schematic.hypergraph.add(["D", "E", "F"]);
    const [D, E, F] = edge.nodes;
    expect(D.value).toEqual("D");
    expect(E.value).toEqual("E");
    expect(F.value).toEqual("F");
    expect(schematic.export()).toEqual("A -> B -> C\n\nD -> E -> F");
    expect(schematic.hyperedges.length).toEqual(2);
});

test("remove hyperedge", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\nD -> E -> F");
    const hyperedges = schematic.hypergraph.hyperedges;
    const [ABC, DEF] = hyperedges;
    ABC.remove();
    expect(schematic.hyperedges.length).toEqual(1);
    expect(schematic.export()).toEqual("D -> E -> F");

    DEF.remove();
    expect(schematic.hyperedges.length).toEqual(0);
    expect(schematic.export()).toEqual("");

    expect(schematic.tree.children.length).toEqual(0);
});

test("hypertextify global and local hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nThis is global hypertext.\n\n# A\nThis is local hypertext for A");

    const hypertexts = schematic.hypertexts.all;
    expect(hypertexts.length).toEqual(2);

    const global = schematic.hypertexts.global;
    expect(global.length).toEqual(1);
    expect(global[0].value).toEqual("This is global hypertext.");
    expect(global[0].owners).toEqual(["global"]);

    const local = schematic.hypertexts.get("A");
    expect(local.length).toEqual(1);
    expect(local[0].value).toEqual("This is local hypertext for A");
    expect(local[0].owners).toEqual(["A"]);
});

test("modify global hypertext", async () => {
    const schematic = new GeneralSchematics("This is global hypertext");
    const [hypertext] = schematic.hypertexts.global;
    hypertext.value = "This is new global hypertext";
    expect(hypertext.owners).toEqual(["global"]);
    expect(schematic.export()).toEqual("This is new global hypertext");
});

test("remove global hypertext", async () => {
    const schematic = new GeneralSchematics("This is global hypertext");
    const [hypertext] = schematic.hypertexts.global;
    hypertext.remove();
    expect(schematic.export()).toEqual("");
});

test("add non-local hypertext", async () => {
    const schematic = new GeneralSchematics("## A\nThis is global hypertext because A doesn't exist.");
    expect(schematic.hypertexts.global.length).toEqual(1);
    const [hypertext] = schematic.hypertexts.global;
    expect(hypertext.owners).toEqual(["global"]);
    expect(hypertext.value).toEqual("This is global hypertext because A doesn't exist.");

    expect(schematic.hypertexts.get("A").length).toEqual(0);
});

test("tokenize symbol with period regression", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nThis is some hypertext for A.");
    expect(schematic.hypertexts.global.length).toEqual(0);
    const hypertexts = schematic.hypertexts.get("A");
    expect(hypertexts.length).toEqual(1);
    expect(hypertexts[0].value).toEqual("This is some hypertext for A.");
});

test("reclassify hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nThis is some hypertext for A.");
    const [A, _] = schematic.hyperedges[0].nodes;
    expect(A.hypertexts.length).toEqual(1);
    const hypertext = A.hypertexts[0];
    expect(hypertext.value).toEqual("This is some hypertext for A.");

    hypertext.value = "New hypertext";
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.hypertexts.global.length).toEqual(1);

    hypertext.value = "New hypertext for A";
    expect(A.hypertexts.length).toEqual(1);
    expect(schematic.hypertexts.global.length).toEqual(0);
});

test("simple hypertext attaches to two symbols", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nThis is attached to A and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(A.hypertexts.length).toEqual(1);
    expect(A.hypertexts[0].value).toEqual("This is attached to A and B");
    expect(B.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].value).toEqual("This is attached to A and B");
    expect(B.hypertexts[0].owners).toEqual(["A", "B"]);
    B.hypertexts[0].value = "This is attached to B";
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.export()).toEqual("A -> B -> C\n\nThis is attached to B");
});

test("complex hypertext attaches to two symbols", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\n## A\nThis is attached to header and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].owners).toEqual(["A", "B"]);

    const hypertext = B.hypertexts[0];
    hypertext.remove();
    expect(B.hypertexts.length).toEqual(0);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.export()).toEqual("A -> B -> C");
});


test("add symbol hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(A.hypertexts.length).toEqual(0);
    A.hypertext.add("This is some hypertext for A");

    expect(A.hypertexts.length).toEqual(1);
    expect(A.hypertexts[0].value).toEqual("This is some hypertext for A");
    A.hypertexts[0].value = "New hypertext for B";

    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(1);
    expect(schematic.export()).toEqual("A -> B -> C\n\n## A\n\nNew hypertext for B");
});

test("modifying hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const hypertext = schematic.hypertexts.add("This is some global hypertext");
    const [A, B, C] = schematic.hyperedges[0].nodes;

    expect(hypertext.owners).toEqual(["global"]);
    expect(hypertext.value).toEqual("This is some global hypertext");

    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(0);
    expect(C.hypertexts.length).toEqual(0);

    hypertext.value = "This is some global hypertext with A"
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(0);
    expect(C.hypertexts.length).toEqual(0);

    hypertext.value = "This is some global hypertext with A, B"
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(1);
    expect(C.hypertexts.length).toEqual(0);

    hypertext.value = "This is some global hypertext with A, B, C"
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts.length).toEqual(1);
    expect(C.hypertexts.length).toEqual(1);

    hypertext.value = "This is some global hypertext with B, C"
    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(1);
    expect(C.hypertexts.length).toEqual(1);

    hypertext.remove();
    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(0);
    expect(C.hypertexts.length).toEqual(0);
});

test("add global hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertexts.add("This is some hypertext")
    expect(schematic.export()).toEqual("This is some hypertext");
    expect(schematic.hypertexts.global.length).toEqual(1);
});

test("add node hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertexts.add("A", "This is some hypertext")

    expect(schematic.export()).toEqual("## A\n\nThis is some hypertext");

    schematic.hypertexts.add("A", "This is some more hypertext")
    expect(schematic.export()).toEqual("## A\n\nThis is some hypertext\nThis is some more hypertext");
});

test("adding node localized hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertexts.add("A", "This is some hypertext")
    schematic.hypertexts.add("This is some global hypertext");

    expect(schematic.hypertexts.global.length).toEqual(2);
    schematic.hypergraph.add(["A", "B", "C"]);

    expect(schematic.hypertexts.global.length).toEqual(1);
    expect(schematic.hypertexts.get("A").length).toEqual(1);
});

test("hyperedges before hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\n## A\nThis is attached to header and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].owners).toEqual(["A", "B"]);

    const hypertext = B.hypertexts[0];
    hypertext.remove();
    expect(B.hypertexts.length).toEqual(0);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.export()).toEqual("A -> B -> C");
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
    expect(schematic1.hash).toEqual(schematic2.hash);
});

test("hypertext import modify export import", async () => {
    const schematic = new GeneralSchematics("## A\nThis is some hypertext with B\nAnd more for C.\n\nA -> B -> C");
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.get("A").length).toEqual(2);
    expect(schematic.hypertexts.get("B").length).toEqual(1);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.hypertexts.get("B")[0].value = "Modified with B";
    schematic.hypertexts.get("C")[0].value = "Modified with C";
    expect(schematic.hypertexts.get("A").length).toEqual(2);
    expect(schematic.hypertexts.get("B").length).toEqual(1);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    const exported = schematic.export();
    expect(exported).toEqual("## A\n\nModified with B\nModified with C\n\nA -> B -> C");

    const schematic2 = new GeneralSchematics(exported);
    expect(schematic2.hypertexts.get("A").length).toEqual(2);
    expect(schematic2.hypertexts.get("B").length).toEqual(1);
    expect(schematic2.hypertexts.get("C").length).toEqual(1);
    expect(schematic2.hypertexts.get("A")[0].value).toEqual("Modified with B");
    expect(schematic2.hypertexts.get("A")[1].value).toEqual("Modified with C");
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
    expect(schematic.nodes[0].value).toEqual("This is A");
    expect(schematic.nodes[1].value).toEqual("This is B");
    expect(schematic.nodes[2].value).toEqual("This is C");
    expect(schematic.export()).toEqual("This is A -> This is B -> This is C");
});



// symbol headers with spaces


// A -> B -> A will break....

// A -> 1 -> 2
// A -> 1 -> B ...will break

// TODO: parse keeps UUIDs with multiple symbols (A -> B -> C, A -> 1 -> 2)


// TODO: Add hypertext in different contexts
// 1 -> B
// A -> B
// # B
// stuff
//
// # 1 -> B
// stuff

// TODO: Uppercase/lowercase symbols...shouldn't matter?
// TODO: schematics should generate actions to be performed...keeps tree and hypergraph in sync and gives undo/redo for free
// TODO: CONTEXTUAL HYPERTEXT (A -> B vs 1 -> B)
// TODO: Our parser right now is really dumb..we're gonna miss a lot of markdown elements cuz we're only getting text. Right now it's a subset. it should be a superset
// INTERWINGLE