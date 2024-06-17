import GeneralSchematics from "@lib/generalschematics"
import { inspect } from "unist-util-inspect"
import { matches, select, selectAll } from 'unist-util-select'

import { expect, test, beforeAll } from "vitest";

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
    const tree = schematic.tree;

    const hyperedges = selectAll("hyperedge", tree);
    expect(hyperedges.length).toEqual(2);
    expect(hyperedges[0].children.length).toEqual(3);
    expect(hyperedges[0].children[0].value).toEqual("A");
    expect(hyperedges[0].children[1].value).toEqual("B");
    expect(hyperedges[0].children[2].value).toEqual("C");
    expect(hyperedges[1].children.length).toEqual(3);
    expect(hyperedges[1].children[0].value).toEqual("1");
    expect(hyperedges[1].children[1].value).toEqual("2");
    expect(hyperedges[1].children[2].value).toEqual("3");

    expect(schematic.export()).toEqual("A -> B -> C\n1 -> 2 -> 3");
    expect(schematic.html).toEqual("<p>A -> B -> C<br>\n1 -> 2 -> 3</p>");
    // expect(schematic.hyperedges).toEqual([["A", "B", "C"], ["1", "2", "3"]]);
    // expect(schematic.nodes).toEqual(["A", "B", "C"]);
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

    const hypertexts = selectAll("hypertext", schematic.tree);
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

test("delete global hypertext", async () => {
    const schematic = new GeneralSchematics("This is global hypertext");
    const [hypertext] = schematic.hypertexts.global;
    hypertext.delete();
    expect(schematic.export()).toEqual("");
});

test("add non-local hypertext", async () => {
    const schematic = new GeneralSchematics("## A\nThis is global hypertext because A doesn't exist.");
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
    B.hypertexts[0].value = "This is attached to only B";
    expect(B.hypertexts.length).toEqual(1);
    expect(A.hypertexts.length).toEqual(0);
    expect(schematic.export()).toEqual("A -> B -> C\n\nThis is attached to only B");
});

test.only("complex hypertext attaches to two symbols", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\n# A\nThis is attached to header and B");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    schematic.debug();
    expect(B.hypertexts.length).toEqual(1);
    expect(B.hypertexts[0].owners).toEqual(["A", "B"]);

    // expect(A.hypertexts.length).toEqual(1);
    // expect(A.hypertexts[0].value).toEqual("This is attached to A and B");
    // expect(B.hypertexts[0].value).toEqual("This is attached to A and B");
    // B.hypertexts[0].value = "This is attached to only B";
    // expect(B.hypertexts.length).toEqual(1);
    // expect(A.hypertexts.length).toEqual(0);
    // expect(schematic.export()).toEqual("A -> B -> C\n\nThis is attached to only B");
});




// test.only("complex hypertext attaches to two symbols", async () => {

test.skip("add symbol hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, _] = schematic.hyperedges[0].nodes;
    expect(A.hypertexts.length).toEqual(0);
    A.hypertext.add("This is some hypertext for A");

    expect(A.hypertexts.length).toEqual(1);
    expect(A.hypertexts[0].value).toEqual("This is some hypertext for A");
    A.hypertexts[0].value = "New hypertext for B";

    schematic.debug();
    expect(A.hypertexts.length).toEqual(0);
    expect(B.hypertexts.length).toEqual(1);
});

// Add header-ed hypertext
// TODO: referencing another symbol in hypertext attaches to both


test.skip("add local hypertext", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, B, C] = schematic.hyperedges[0].nodes;
    console.log("A", A);
    /*
    expect(hypertext.owners).toEqual(["global"]);
    expect(hypertext.value).toEqual("This is global hypertext because A doesn't exist.");

    expect(schematic.hypertext.get("A").length).toEqual(0);
    */
});


// TODO: Add new hypertext (globally & locally)
// TODO: Modify hypertext object...directly there....
// TODO: Add / remove local hypertext
// TODO: Remove paragraph if no hypertext
// TODO: Add it back if hypertext is added

test.skip("add global hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertext.add("This is some hypertext")
    expect(schematic.export()).toEqual("This is some hypertext");

    expect(schematic.hypertext.size).toEqual(1);

    console.log(inspect(schematic.tree));
});

// TODO: We want an object interface to hypertext...just like Hypergraph
// TODO: Give every node a UUID

test.skip("add node hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertext.add("A", "This is some hypertext")

    expect(schematic.export()).toEqual("## A\nThis is some hypertext");

    schematic.hypertext.add("A", "This is some more hypertext")
    expect(schematic.export()).toEqual("## A\nThis is some hypertext\nThis is some more hypertext");
});

test.skip("add node hypertext", async () => {
    const schematic = new GeneralSchematics();
    schematic.hypertext.add("A", "This is some hypertext")
    schematic.hypertext.add("This is some global hypertext");

    const exported = schematic.export();
    expect(exported).toEqual("## A\nThis is some hypertext\n\nThis is some global hypertext");
    expect(schematic.hypertext.size).toEqual(2);


    // const hypertext = schematic.hypertext.get("A");
    // console.log(hypertext);


    // schematic.hypertext.add("A", "This is some more hypertext")
    // expect(schematic.export()).toEqual("## A\nThis is some hypertext\nThis is some more hypertext");
});

// TODO: easy interface for accessing / changing / deleting hypertext
// TODO: Bug where adding symbol hypertext...then adding global hypertext gets added to symbol hypertext    ...should be ok with <section>?
// TODO: Every node gets a UUID?


// TODO: Add symbol specific hypertext
// TODO: Add context specific hypertext


// TODO: Add hypertext...

// TODO: Clean interface for nodes / hyperedges / referencing them in hypergraph / and back...just use those objects!?!?!?!!!!!!!

// TODO: Add hyperedges / nodes as dynamic getters



// Multiple ones
// A -> B -> C
// 1 -> 2 -> 3

// To do this "right" we actually need to translate these into a symbol properly
// And then fully translate them back to markdown







// TODO: We need nodes like connected....on uuid? how to make it stable?

// TODO: Focus a lot on the interface for adding/editing/modifying

// schematic.nodes["A"].add("B");
// schematic.hypertext["A"].add("B")
// ...

/*
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
    const schematic = new GeneralSchematics("A -> B -> C\n## A\nSection about the first letter of the alphabet");
    expect(schematic.export()).toEqual("A -> B -> C\n\n## A\n\nSection about the first letter of the alphabet");
});

test("write hypertext for symbol", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    schematic.addHypertext("A", "Section about the first letter of the alphabet");

    expect(schematic.hypertext.get("A").length).toEqual(1);
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
    expect(schematic.export()).toEqual("A -> B -> C\n\n## A\n\nSection about the first letter of the alphabet");
});

test("write multiple hypertext for symbol", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    schematic.addHypertext("A", "Section about the first letter of the alphabet");
    schematic.addHypertext("A", "Second piece of hypertext");

    expect(schematic.hypertext.get("A").length).toEqual(2);
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
    expect(schematic.hypertext.get("A")[1]).toEqual("Second piece of hypertext");
    expect(schematic.export()).toEqual("A -> B -> C\n\n## A\n\nSection about the first letter of the alphabet\n\nSecond piece of hypertext");

    const schematic2 = new GeneralSchematics(schematic.export());
    schematic2.addHypertext("A", "Third piece of hypertext");
    expect(schematic2.hypertext.get("A").length).toEqual(3);
});

test("overwrite hypertext for symbol", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    schematic.setHypertext("A", "New section about the first letter of the alphabet123");
    schematic.setHypertext("A", "New section about the first letter of the alphabet");
    expect(schematic.hypertext.get("A")[0]).toEqual("New section about the first letter of the alphabet");
    expect(schematic.export()).toEqual("A -> B -> C\n\n## A\n\nNew section about the first letter of the alphabet");
});

test("multiple symbols multiple hyperedges", async () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\n# A\n\nSection about the first letter of the alphabet\n\n# B\n\nSection about the second letter of the alphabet");
    expect(schematic.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
    expect(schematic.hypertext.get("B")[0]).toEqual("Section about the second letter of the alphabet");
    schematic.addHypertext("A", "Second piece of hypertext for AAA");
    schematic.addHypertext("B", "Second piece of hypertext for BBB");

    const schematic1 = new GeneralSchematics(schematic.export());
    expect(schematic1.hypertext.get("A").length).toEqual(2);
    expect(schematic1.hypertext.get("B").length).toEqual(2);
    expect(schematic1.hypertext.get("A")[0]).toEqual("Section about the first letter of the alphabet");
    expect(schematic1.hypertext.get("A")[1]).toEqual("Second piece of hypertext for AAA");
    expect(schematic1.hypertext.get("B")[0]).toEqual("Section about the second letter of the alphabet");
    expect(schematic1.hypertext.get("B")[1]).toEqual("Second piece of hypertext for BBB");
});

*/

// We have a bit of a problem...because all of our editing is done on the objects themselves...node.add("BLAH");
// We need this in sync with the hypertext tree somehow
// We probably want to uniquely identify nodes...then uniquely identify them in hypertext


// TODO: better interface for setting hypertext...set it on the Node?
// TODO: is having to save and re-parse the hypertext/hypergraph every change really feasible?

// TODO: schematics should generate actions to be performed...keeps tree and hypergraph in sync and gives undo/redo for free
// TODO: soft break bug with single \n above -> doesn't translate back properly on export
// TODO: Reading node header sections
// TODO: Writing node header sections
// TODO: replace hypergraph.hash with GeneralSchematic.hash
// TODO: Ideally we abstract this. We have ways to get directly to the part of the tree we want, and know how to do certain actions.
//            And this is handled through a transformation library to work at a higher level

// TODO: Uppercase/lowercase symbols...shouldn't matter?
// TODO: Keep order! This is going to get annoying to have all hyperedges at top and all hypertext on bottom
// TODO: Our parser right now is really dumb..we're gonna miss a lot of markdown elements cuz we're only getting text. Right now it's a subset. it should be a superset

// INTERWINGLE
// TODO: CONTEXTUAL HYPERTEXT (A -> B vs 1 -> B)