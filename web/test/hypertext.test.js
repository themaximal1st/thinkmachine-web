import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

test("missing hypertext symbol", () => {
    const schematic = new GeneralSchematics("A -> B -> C\nThis is some hypertext");
    expect(schematic.export()).toEqual("A -> B -> C\nThis is some hypertext");

    const [A, _] = schematic.get(["A"]).nodes;
    expect(A.hypertexts.length).toEqual(0);
    A.hypertext.add("This is about one");
    expect(A.hypertexts.length).toEqual(1);
});


test("numeric symbol", () => {
    const schematic = new GeneralSchematics(`1 -> 2 -> 3\nThis is for 1`);
    expect(schematic.hyperedges[0].nodes[0].value).toEqual("1");
    expect(schematic.hyperedges[0].nodes[1].value).toEqual("2");
    expect(schematic.hyperedges[0].nodes[2].value).toEqual("3");
    expect(schematic.export()).toEqual("1 -> 2 -> 3\nThis is for 1");

    const [one, _] = schematic.get(["1"]).nodes;
    expect(one).toBeDefined();
    expect(one.hypertexts.length).toEqual(1);
    schematic.hyperedges[0].nodes[0].hypertext.add("This is about one");
    expect(one.hypertexts.length).toEqual(2);
});
