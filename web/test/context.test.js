import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";

// Get context across the hypergraph, useful for navigating with keyboard or UI and exposing relationships

test("simple isolated hyperedge", () => {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["A", "B", "C"]);
    const [A, B, C] = edge.nodes;

    const data = thinkabletype.graphData();

    let context;
    context = A.context(data);
    expect(context.prev).toEqual([]);
    expect(context.next).toEqual([B]);

    context = B.context(data);
    expect(context.prev).toEqual([A]);
    expect(context.next).toEqual([C]);

    context = C.context(data);
    expect(context.prev).toEqual([B]);
    expect(context.next).toEqual([]);
});

test("simple fusion hyperedge", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });
    const edge1 = thinkabletype.add(["A", "B", "C"]);
    const [A, B, C] = edge1.nodes;
    const edge2 = thinkabletype.add(["C", "D", "E"]);
    const [C2, D, E] = edge2.nodes;

    const data = thinkabletype.graphData();
    let context;

    context = A.context(data);
    expect(context.prev).toEqual([]);
    expect(context.next).toEqual([B]);

    context = B.context(data);
    expect(context.prev).toEqual([A]);
    expect(context.next).toEqual([C]);

    context = C.context(data);
    expect(context.prev).toEqual([B]);
    expect(context.next).toEqual([D]);

    context = D.context(data);
    expect(context.prev).toEqual([C]);
    expect(context.next).toEqual([E]);

    context = E.context(data);
    expect(context.prev).toEqual([D]);
    expect(context.next).toEqual([]);
});

test("simple confluence hyperedge", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE
    });
    const edge1 = thinkabletype.add(["A", "B", "C"]);
    const [A, B, C] = edge1.nodes;
    const edge2 = thinkabletype.add(["A", "1", "2"]);
    const [A2, One, Two] = edge2.nodes;

    const data = thinkabletype.graphData();
    let context;

    context = A.context(data);
    expect(context.prev).toEqual([]);
    expect(context.next).toEqual([B, One]);

    context = B.context(data);
    expect(context.prev).toEqual([A]);
    expect(context.next).toEqual([C]);

    context = C.context(data);
    expect(context.prev).toEqual([B]);
    expect(context.next).toEqual([]);

    context = One.context(data);
    expect(context.prev).toEqual([A]);
    expect(context.next).toEqual([Two]);
});

test("simple confluence hyperedge", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.BRIDGE
    });
    const edge1 = thinkabletype.add(["A", "vs", "B"]);
    const [A, vs1, B] = edge1.nodes;
    const edge2 = thinkabletype.add(["1", "vs", "2"]);
    const [One, vs2, Two] = edge2.nodes;

    const data = thinkabletype.graphData();
    let context;

    context = A.context(data);
    expect(context.prev).toEqual([]);
    expect(context.next).toEqual([vs1]);

    context = vs1.context(data);
    expect(context.prev).toEqual([A, vs2]);
    expect(context.next).toEqual([B]);

    context = B.context(data);
    expect(context.prev).toEqual([vs1]);
    expect(context.next).toEqual([]);

    context = One.context(data);
    expect(context.prev).toEqual([]);
    expect(context.next).toEqual([vs2]);

    context = vs2.context(data);
    expect(context.prev).toEqual([One, vs1]);
    expect(context.next).toEqual([Two]);

    context = Two.context(data);
    expect(context.prev).toEqual([vs2]);
    expect(context.next).toEqual([]);
});


test("fusion bridge context regression", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const edge1 = thinkabletype.add(["A", "B"]);
    const [A1, B] = edge1.nodes;
    const edge2 = thinkabletype.add(["A", "1"]);
    const [A2, One] = edge2.nodes;

    const data = thinkabletype.graphData();

    expect(data.nodes[1].nodeUUIDs.has(A2.uuid)).toBe(true);
    expect(data.nodes[1].nodeUUIDs.has(A1.uuid)).toBe(true);
});