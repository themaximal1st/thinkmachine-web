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


// Store references to nodes in the hyperedge graphData
test("reference confluence fusion", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["C", "D", "E"],
    ], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });

    const activeNodeUUID = thinkabletype.hyperedges[1].firstNode.uuid;

    let data;

    data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.FUSION;
    data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
    expect(data.links[2].nodeUUIDs.has(activeNodeUUID)).toBe(true);
    expect(data.nodes[2].nodeUUIDs.has(activeNodeUUID)).toBe(true);
});

test("confluence bridge", () => {
    const thinkabletype = new ThinkableType([
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ], { interwingle: ThinkableType.INTERWINGLE.FUSION });

    const activeNodeUUID = thinkabletype.hyperedges[1].secondNode.uuid;

    let data;

    data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(6);
    expect(data.links.length).toBe(4);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.BRIDGE;
    data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(7);
    expect(data.links.length).toBe(6);
    expect(data.links[5].nodeUUIDs.has(activeNodeUUID)).toBe(true);
    expect(data.nodes[6].nodeUUIDs.has(activeNodeUUID)).toBe(true);
});

test("fusion find reference UUID", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["C", "D", "E"],
    ], { interwingle: ThinkableType.INTERWINGLE.FUSION });

    const activeNodeUUID = thinkabletype.hyperedges[1].firstNode.uuid;
    const newNodeUUID = thinkabletype.hyperedges[0].lastNode.uuid;

    const data = thinkabletype.graphData();
    const node = ThinkableType.findReferenceUUID(data, activeNodeUUID);
    expect(node.uuid).toBe(newNodeUUID);
});

test("confluence bridge", () => {
    const thinkabletype = new ThinkableType([
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ], { interwingle: ThinkableType.INTERWINGLE.BRIDGE });

    const activeNodeUUID = thinkabletype.hyperedges[1].secondNode.uuid;

    const data = thinkabletype.graphData();
    const node = ThinkableType.findReferenceUUID(data, activeNodeUUID);
    expect(node).toBeDefined();
    expect(node.bridge).toBe(true);
    expect(node.nodeUUIDs.has(activeNodeUUID)).toBe(true);
});