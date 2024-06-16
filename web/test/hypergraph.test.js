import GeneralSchematics from "@lib/generalschematics"

import { expect, test, beforeAll } from "vitest";

// TODO: Problem is how do you programatically modify the hypergraph and the tree and keep everything in sync?
//        You'd have to constantly re-parse everything and add wrappers around every modification
//
//       Solution is...you have to get rid of hypergraph state, and just use the tree state
//         It's a little harder, but it keeps everything in one place.
//         Plus...does it save you from having to re-parse everything?

test.only("parse modify and save", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.hypergraph.hyperedges.length).toBe(1);
    expect(schematic.hypergraph.hyperedges[0].length).toBe(3);
});


// const C = schematic.hypergraph.hyperedges[0].lastNode;
// C.add("D");
// expect(schematic.export()).toBe("A -> B -> C -> D");