import Parser from "@generalschematics/Parser.js"
const { Hypertext, Hyperedge, Node, EmptyLine, Header } = Parser;

import { expect, test } from "vitest";

test("simple html", async () => {
    const parser = new Parser("Hello World");
    expect(parser.html).toBe(`<div class="hypertext">Hello World</div>`);
});

test("hyperlinked symbols", async () => {
    const parser = new Parser("A -> B -> C");
    const uuids = parser.nodes.map(node => node.uuid);
    expect(parser.html).toBe(`<div class="hyperedge"><a href="#${uuids[0]}" class="node">A </a>-&gt;<a href="#${uuids[1]}" class="node"> B </a>-&gt;<a href="#${uuids[2]}" class="node"> C</a></div>`);
});

test.only("duplicate hyperedge broken html regression", async () => {
    const parser = new Parser("A -> B -> C\nA -> B -> C\nThis is some A text.");
    const uuids = parser.nodes.map(node => node.uuid);
    console.log(parser.html);
    // expect(parser.html).toBe(`<div class="hyperedge"><a href="#${uuids[0]}" class="node">A </a>-&gt;<a href="#${uuids[1]}" class="node"> B </a>-&gt;<a href="#${uuids[2]}" class="node"> C</a></div>`);
});


// TODO: "1->2" doesn't look right ...this is why we need to parse on input!

// TODO: html should work on input..not output..keeps it consistent...hrmmmm
// TODO: html should output current node/hyperedge colors

// TODO: Need html mode...that is very lightly wrapped content divs