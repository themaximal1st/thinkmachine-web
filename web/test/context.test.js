import GeneralSchematics from "@lib/generalschematics"

import { expect, test } from "vitest";

// Get context across the hypergraph, useful for navigating with keyboard or UI and exposing relationships

test("simple isolated hyperedge", () => {
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["A", "B", "C"]);
    const [A, B, C] = edge.nodes;

    const data = schematic.graphData();

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
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });
    const edge1 = schematic.add(["A", "B", "C"]);
    const [A, B, C] = edge1.nodes;
    const edge2 = schematic.add(["C", "D", "E"]);
    const [C2, D, E] = edge2.nodes;

    const data = schematic.graphData();
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
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE
    });
    const edge1 = schematic.add(["A", "B", "C"]);
    const [A, B, C] = edge1.nodes;
    const edge2 = schematic.add(["A", "1", "2"]);
    const [A2, One, Two] = edge2.nodes;

    const data = schematic.graphData();
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

test.skip("simple bridge hyperedge", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE
    });
    const edge1 = schematic.add(["A", "vs", "B"]);
    const [A, vs1, B] = edge1.nodes;
    const edge2 = schematic.add(["1", "vs", "2"]);
    const [One, vs2, Two] = edge2.nodes;

    const data = schematic.graphData();
    let context;

    context = A.context(data);
    expect(context.prev).toEqual([]);
    expect(context.next).toEqual([vs1]);

    context = vs1.context(data);
    expect(context.prev).toEqual([A, vs2]);
    // expect(context.next).toEqual([B]);

    // context = B.context(data);
    // expect(context.prev).toEqual([vs1]);
    // expect(context.next).toEqual([]);

    // context = One.context(data);
    // expect(context.prev).toEqual([]);
    // expect(context.next).toEqual([vs2]);

    // context = vs2.context(data);
    // expect(context.prev).toEqual([One, vs1]);
    // expect(context.next).toEqual([Two]);

    // context = Two.context(data);
    // expect(context.prev).toEqual([vs2]);
    // expect(context.next).toEqual([]);
});


test.skip("fusion bridge context regression", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.add(["A", "B"]);
    const [A1, B] = edge1.nodes;
    const edge2 = schematic.add(["A", "1"]);
    const [A2, One] = edge2.nodes;

    const data = schematic.graphData();

    expect(data.nodes[1].nodeUUIDs.has(A2.uuid)).toBe(true);
    expect(data.nodes[1].nodeUUIDs.has(A1.uuid)).toBe(true);
});

test("stacked no context (interwingle)", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["A", "X", "Y"]
    ]);

    const edge1 = schematic.hyperedges[0];
    const [A1, B, C] = edge1.nodes;
    const edge2 = schematic.hyperedges[1];
    const [A2, X, Y] = edge2.nodes;

    const data = schematic.graphData();

    let context = A1.context(data);
    expect(context.stack.length).toBe(1);
    expect(context.stack[0].uuid).toBe(A1.uuid);
});

test.skip("stacked context (fusion)", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["A", "X", "Y"]
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.hyperedges[0];
    const [A1, B, C] = edge1.nodes;
    const edge2 = schematic.hyperedges[1];
    const [A2, X, Y] = edge2.nodes;

    const data = schematic.graphData();

    let context;
    context = A1.context(data);
    expect(context.stack.length).toBe(2);
    expect(data.nodes[0].uuid).toBe(A2.uuid);
    expect(context.stack[0].uuid).toBe(A1.uuid);

    context = B.context(data);
    expect(context.stack.length).toBe(1);

    context = C.context(data);
    expect(context.stack.length).toBe(1);
});

test.skip("stacked context order", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["A", "X", "Y"]
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.hyperedges[0];
    const [A1, B, C] = edge1.nodes;
    const edge2 = schematic.hyperedges[1];
    const [A2, X, Y] = edge2.nodes;

    const data = schematic.graphData();

    const context = A1.context(data);
    const nextEdges = context.next.map(node => node.hyperedge.uuid);
    const stackEdges = context.stack.map(node => node.hyperedge.uuid);

    expect(nextEdges).toEqual(stackEdges);
});

// TODO: bridges?