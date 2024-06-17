import GeneralSchematics from "@lib/generalschematics"

import { expect, test, beforeAll } from "vitest";

test("parse interwingle isolated", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.hyperedges.length).toBe(1);
    const [A, B, C] = schematic.hyperedges[0].nodes;
    expect(A.value).toBe("A");
    expect(A.id).toBe("0:A");
    expect(B.value).toBe("B");
    expect(B.id).toBe("0:A.B");
    expect(C.value).toBe("C");
    expect(C.id).toBe("0:A.B.C");

    schematic.hypergraph.add(["D", "E", "F"]);
    const [D, E, F] = schematic.hyperedges[1].nodes;
    expect(D.value).toBe("D");
    expect(D.id).toBe("1:D");
    expect(E.value).toBe("E");
    expect(E.id).toBe("1:D.E");
    expect(F.value).toBe("F");
    expect(F.id).toBe("1:D.E.F");
});

test("parse interwingle confluence", async () => {
    const schematic = new GeneralSchematics("A -> B -> C", { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });
    expect(schematic.hyperedges.length).toBe(1);
    const [A, B, C] = schematic.hyperedges[0].nodes;
    expect(A.value).toBe("A");
    expect(A.id).toBe("A");
    expect(B.value).toBe("B");
    expect(B.id).toBe("A.B");
    expect(C.value).toBe("C");
    expect(C.id).toBe("A.B.C");

    schematic.hypergraph.add(["A", "1", "2"]);
    const [A1, One, Two] = schematic.hyperedges[1].nodes;
    expect(A1.value).toBe("A");
    expect(A1.id).toBe("A");
    expect(One.value).toBe("1");
    expect(One.id).toBe("A.1");
    expect(Two.value).toBe("2");
    expect(Two.id).toBe("A.1.2");
});
