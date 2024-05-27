import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";

// ISOLATED

test("graph data (interwingle)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
});

test("single hyperedge (isolate)", () => {
    const thinkabletype = new ThinkableType([["A", "B", "C"]]);
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[0].edgeIDs).toContain("0:A.B.C");

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1].edgeIDs).toContain("0:A.B.C");
});



// CONFLUENCE

test("graph data (confluence)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
});

test("single hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType([["A", "B", "C"]], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[0].edgeIDs).toContain("A.B.C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1].edgeIDs).toContain("A.B.C");
});

test("multiple hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["A", "1", "2"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE
    });

    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.symbols).toEqual(["A", "B", "C", "1", "2"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[3].id).toBe("A.1->A.1.2");

    expect(data.links[0].edgeIDs).toContain("A.B.C");
    expect(data.links[1].edgeIDs).toContain("A.B.C");
    expect(data.links[2].edgeIDs).toContain("A.1.2");
    expect(data.links[3].edgeIDs).toContain("A.1.2");
});

// FUSION

test("fusion start", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const thinkabletype = new ThinkableType(hyperedges, {
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);


    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A.B.C->C.D");
    expect(data.links[3].id).toBe("C.D->C.D.E");
});

test("fusion end", () => {
    const hyperedges = [
        // A.B.C && 1.2.C with C as fusion node
        ["A", "B", "C"],
        ["1", "2", "C"],
    ];

    const thinkabletype = new ThinkableType(hyperedges, {
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[3].id).toBe("1.2->A.B.C");
});


test("fusion no bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["B", "C"]);
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["3", "B", "4"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(9);
    expect(data.links.length).toBe(10);
});

test("two-edge start bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["B", "C"]);

    const data = thinkabletype.graphData();

    expect(data.nodes.length).toBe(4);
    expect(data.nodes[0].name).toBe("1");
    expect(data.nodes[1].name).toBe("B");
    expect(data.nodes[2].name).toBe("2");
    expect(data.nodes[3].name).toBe("C");
    expect(data.links.length).toBe(3);
    expect(data.links[0].id).toBe("1->1.B");
    expect(data.links[1].id).toBe("1.B->1.B.2");
    expect(data.links[2].id).toBe("1.B->B.C");
});

test("two-edge start fusion incoming", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["A", "B"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

test("continuous fusion", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["B", "C"]);
    thinkabletype.add(["C", "D"]);
    thinkabletype.add(["D", "E"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two edge disconnected", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["B", "2"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);
});


test("two edge start connection", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["A", "1"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

test("two edge middle connection", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["B", "2"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

test("two edge end connection", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["C", "3"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

test("two edge multiple start connections", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "Y", "Z"],
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["A", "1"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7); // would be 8 but A hits confluence node
});

test("two edge multiple middle connections", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["X", "Y", "Z"],
            ["A", "Y", "C"],
            ["1", "2", "3"],
            ["Y", "1"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
});

test("two edge multiple end connections", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["X", "Y", "Z"],
            ["A", "B", "Z"],
            ["1", "2", "3"],
            ["Z", "1"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);
});

test("two edge close loop", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["A", "C"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(3);
});


test("closed fusion loop", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["A", "B", "C", "A"]);

    const data = thinkabletype.graphData();

    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(3);
});


test("two two-edge connections", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    thinkabletype.add(["A", "B", "C"]);
    thinkabletype.add(["D", "A"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

// BRIDGE

test("bridge", () => {
    const hyperedges = [
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ];

    const thinkabletype = new ThinkableType({
        hyperedges,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE
    });

    expect(thinkabletype.hyperedges.length).toEqual(2);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(7);
    expect(data.links.length).toBe(6);

    expect(data.links[0].id).toBe("A->A.vs");
    expect(data.links[1].id).toBe("A.vs->A.vs.B");
    expect(data.links[2].id).toBe("1->1.vs");
    expect(data.links[3].id).toBe("1.vs->1.vs.2");
    expect(data.links[4].id).toBe("vs#bridge->A.vs");
    expect(data.links[5].id).toBe("vs#bridge->1.vs");
});

test("single node edge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add(["A"]);
    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(1);
});

test("two-edge end bridge incoming", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["A", "B"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

test("two-edge end bridge reverse order", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["1", "B", "2"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

test("two-edge fusion skip bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["B", "C"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});


test("two-edge confluence skip fusion and bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["B", "C"]);
    thinkabletype.add(["B", "1", "2"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two-edge fusion bridge", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    thinkabletype.add(["A", "B"]);
    thinkabletype.add(["B", "C"]);
    thinkabletype.add(["1", "B", "2"]);
    thinkabletype.add(["3", "B", "4"]);

    const data = thinkabletype.graphData();
    expect(data.nodes.length).toBe(10);
    expect(data.links.length).toBe(12);
});
