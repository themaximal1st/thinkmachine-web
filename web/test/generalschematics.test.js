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

    // console.log(inspect(tree))
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

test("rename node", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const [A, _] = selectAll("node", schematic.tree);
    expect(A.type).toEqual("node");
    expect(A.value).toEqual("A");

    A.value = "A1";

    expect(schematic.export()).toEqual("A1 -> B -> C");
    expect(schematic.hyperedges[0].children[0].value).toEqual("A1");

    expect(schematic.html).toEqual("<p>A1 -> B -> C</p>");
    // expect(schematic.hyperedges..()).toEqual("A1 -> B -> C");
    // expect(schematic.nodes).toEqual(["A", "B", "C"]);
});

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