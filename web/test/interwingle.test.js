import GeneralSchematics from "@lib/generalschematics"

import { expect, test } from "vitest";

test("interwingle isolated id", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ]);

    expect(schematic.interwingle).toBe(GeneralSchematics.INTERWINGLE.ISOLATED);
    expect(schematic.hyperedges.length).toBe(1);
    expect(schematic.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(schematic.hyperedges[0].nodes.length).toBe(3);
    expect(schematic.hyperedges[0].id).toBe("0:A.B.C");
});

test("interwingle confluence id", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });

    expect(schematic.interwingle).toBe(GeneralSchematics.INTERWINGLE.CONFLUENCE);
    expect(schematic.hyperedges.length).toBe(1);
    expect(schematic.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(schematic.hyperedges[0].nodes.length).toBe(3);
    expect(schematic.hyperedges[0].id).toBe("A.B.C");
});

test("node isolated id", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ]);

    const edge = schematic.hyperedges[0];
    expect(edge.nodes[0].id).toBe("0:A");
    expect(edge.nodes[1].id).toBe("0:A.B");
    expect(edge.nodes[2].id).toBe("0:A.B.C");
});

test("node confluence id", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });

    const edge = schematic.hyperedges[0];
    expect(edge.nodes[0].id).toBe("A");
    expect(edge.nodes[1].id).toBe("A.B");
    expect(edge.nodes[2].id).toBe("A.B.C");
});


// Store references to nodes in the hyperedge graphData
test("reference confluence fusion", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["C", "D", "E"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });

    const activeNode = schematic.hyperedges[1].firstNode;

    let data;

    data = schematic.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);

    schematic.interwingle = GeneralSchematics.INTERWINGLE.FUSION;
    data = schematic.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
    expect(data.links[2].nodes.includes(activeNode)).toBe(true);
    expect(data.nodes[2].nodes.includes(activeNode)).toBe(true);
});

test("confluence bridge", () => {
    const schematic = new GeneralSchematics([
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.FUSION });

    const activeNode = schematic.hyperedges[1].secondNode;

    let data;

    data = schematic.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);

    schematic.interwingle = GeneralSchematics.INTERWINGLE.BRIDGE;
    data = schematic.graphData();
    expect(data.nodes.length).toBe(7);
    expect(data.links.length).toBe(6);
    expect(data.links[5].nodes.includes(activeNode)).toBe(true);
    expect(data.nodes[6].nodes.includes(activeNode)).toBe(true);
});

test.skip("fusion find reference UUID", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["C", "D", "E"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.FUSION });

    const activeNodeUUID = schematic.hyperedges[1].firstNode.uuid;
    const newNodeUUID = schematic.hyperedges[0].lastNode.uuid;

    const data = schematic.graphData();
    const uuid = GeneralSchematics.trackUUID(activeNodeUUID, data);
    expect(uuid).toBe(newNodeUUID);
});

test.skip("confluence bridge", () => {
    const schematic = new GeneralSchematics([
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });

    const activeNodeUUID = schematic.hyperedges[1].secondNode.uuid;

    const data = schematic.graphData();
    const uuid = GeneralSchematics.trackUUID(activeNodeUUID, data);
    const node = data.nodes.find(node => node.uuid === uuid);
    expect(node).toBeDefined();
    // expect(node.bridge).toBe(true);
    expect(node.nodeUUIDs.has(activeNodeUUID)).toBe(true);
});