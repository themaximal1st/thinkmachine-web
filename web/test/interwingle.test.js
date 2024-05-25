import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";

test("interwingle isolated id", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    expect(thinkabletype.interwingle).toBe(ThinkableType.INTERWINGLE.ISOLATED);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
    expect(thinkabletype.hyperedges[0].id).toBe("0:A.B.C");
});

test("interwingle confluence id", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });

    expect(thinkabletype.interwingle).toBe(ThinkableType.INTERWINGLE.CONFLUENCE);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
    expect(thinkabletype.hyperedges[0].id).toBe("A.B.C");
});

test("node isolated id", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    expect(edge.nodes[0].id).toBe("0:A");
    expect(edge.nodes[1].id).toBe("0:A.B");
    expect(edge.nodes[2].id).toBe("0:A.B.C");
});

test("node confluence id", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });

    const edge = thinkabletype.hyperedges[0];
    expect(edge.nodes[0].id).toBe("A");
    expect(edge.nodes[1].id).toBe("A.B");
    expect(edge.nodes[2].id).toBe("A.B.C");
});

