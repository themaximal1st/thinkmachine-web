import GeneralSchematics from "@lib/generalschematics"
const Parser = GeneralSchematics.Parser;
import { expect, test } from "vitest";
import fs from "fs"
import path from "path"

// test high-level API — specifics are handled in other tests

test("parse simple doc", async () => {
    const filename = path.join(__dirname, "examples/example1.md");
    const data = fs.readFileSync(filename, "utf-8")

    const start = Date.now();

    const schematic = new GeneralSchematics();

    for (let i = 0; i < 1000; i++) {
        schematic.parse(data);
        expect(schematic.hyperedges.length).toEqual(1);
        expect(schematic.nodes.length).toEqual(3);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

test("parse complex doc", async () => {
    const filename = path.join(__dirname, "examples/example2.md");
    const data = fs.readFileSync(filename, "utf-8")

    const start = Date.now();

    const schematic = new GeneralSchematics();

    for (let i = 0; i < 1000; i++) {
        schematic.parse(data);
        expect(schematic.hyperedges.length).toEqual(66);
        expect(schematic.nodes.length).toEqual(179);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(2000);
});




// TODO: test performance of
// - parsing
// - export
// - graphData