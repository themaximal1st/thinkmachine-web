import Tree from "@lib/generalschematics/Tree"
const { Hypertext, Hyperedge, Node, EmptyLine, Header } = Tree;

import { expect, test } from "vitest";

test("simple html", async () => {
    const tree = Tree.parse("Hello World");
    expect(tree.html).toBe(`<div class="hypertext">Hello World</div>`);
});

test.skip("hyperlinked symbols", async () => {
    const tree = Tree.parse("A -> B -> C");
    const uuids = tree.nodes.map(node => node.uuid);
    expect(tree.html).toBe(`<div class="hyperedge"><a href="#${uuids[0]}" class="node">A </a>-&gt;<a href="#${uuids[1]}" class="node"> B </a>-&gt;<a href="#${uuids[2]}" class="node"> C</a></div>`);
});

test.skip("duplicate hyperedge broken html regression", async () => {
    const tree = new Tree("A -> B -> C\nA -> B -> C\nThis is some A text.");
    const uuids = tree.nodes.map(node => node.uuid);
    console.log(tree.html);
    // expect(tree.html).toBe(`<div class="hyperedge"><a href="#${uuids[0]}" class="node">A </a>-&gt;<a href="#${uuids[1]}" class="node"> B </a>-&gt;<a href="#${uuids[2]}" class="node"> C</a></div>`);
});


// TODO: "1->2" doesn't look right ...this is why we need to parse on input!

// TODO: html should work on input..not output..keeps it consistent...hrmmmm
// TODO: html should output current node/hyperedge colors

// TODO: Need html mode...that is very lightly wrapped content divs