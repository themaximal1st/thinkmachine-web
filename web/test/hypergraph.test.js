import GeneralSchematics from "@lib/generalschematics"

import { expect, test, beforeAll } from "vitest";

// TODO: Figure out how https://milkdown.dev works
// TODO: Problem is how do you programatically modify the hypergraph and the tree and keep everything in sync?
//        You'd have to constantly re-parse everything and add wrappers around every modification
//
//       Solution is...you have to get rid of hypergraph state, and just use the tree state
//         It's a little harder, but it keeps everything in one place.
//         Plus...does it save you from having to re-parse everything?
//
//        We're finding ourselves still having to re-render...because symbols changing means connections changing which means
//        the hypertext and hypergraph links change...so we're still having to re-render everything.
//
//        How can we avoid this? Is there any way? Maybe don't have to totally re-parse...just re-index the current tree?
//          Virtual DOM?

test.only("parse modify and save", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.hypergraph.hyperedges.length).toBe(1);
    expect(schematic.hypergraph.hyperedges[0].length).toBe(3);
});


// const C = schematic.hypergraph.hyperedges[0].lastNode;
// C.add("D");
// expect(schematic.export()).toBe("A -> B -> C -> D");

// GeneralSchematics
// - tree
// (get) hyperedge

// what can we cache? memoize?
