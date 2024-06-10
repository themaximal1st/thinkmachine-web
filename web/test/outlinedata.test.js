import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";

// Interwingle could change a little? ...or we could just limit it to 3 levels and only do fusion starts & bridges

// There's no real way to do certain fusion/bridge nodes without a graph
// A vs B
// 1 vs 2

// A B C & C D E is fine

// but
// A B C & 1 2 C is not

// A B C D E
// 1 2 3 4 5
// A 1
// ^--- doesn't work

// Is outliner the right way to flatten the hypergraph?
// Visually connected links -> no
// Markdown interface -> maybe
// Outliner -> yes...we just need to think it through a little more. build a rapid prototype and start using it.
// Outliner probably needs to stop using graphData and generate its own
// Outliner should have smart links though — lots of fusion/bridge connections as popup links you can select
// Easy way to jump back and forth between editor view and graph view
// Call it Editor...not Outliner
// Need a concept of project scope...or a workspace.
// Should use URL scheme for maximum flexibility
//   namespace://project/a/b
//   sumerians://gilgamesh/epic/story


// TODO: single symbol

// outliner working
// filter working?
// merge graphdata & outlinedata helpers (indexes)

// Export data in outliner format

test("outline data (interwingle)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const data = thinkabletype.outlineData();
    expect(data.nodes.size).toBe(1);

    const A = data.nodes.get("0:A");
    expect(A.id).toBe("0:A");
    expect(A.name).toBe("A");
    expect(A.nodes.size).toBe(1);

    const B = A.nodes.get("0:A.B");
    expect(B.id).toBe("0:A.B");
    expect(B.name).toBe("B");
    expect(B.nodes.size).toBe(1);

    const C = B.nodes.get("0:A.B.C");
    expect(C.id).toBe("0:A.B.C");
    expect(C.name).toBe("C");
    expect(C.nodes.size).toBe(0);
});

// CONFLUENCE

test("graph data (confluence)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], { interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });

    const data = thinkabletype.outlineData();
    expect(data.nodes.size).toBe(1);

    const A = data.nodes.get("A");
    expect(A.id).toBe("A");
    expect(A.name).toBe("A");

    const B = A.nodes.get("A.B");
    expect(B.id).toBe("A.B");
    expect(B.name).toBe("B");

    const C = B.nodes.get("A.B.C");
    expect(C.id).toBe("A.B.C");
    expect(C.name).toBe("C");
});

test("multiple hyperedge (confluence)", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["A", "1", "2"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE
    });

    const data = thinkabletype.outlineData();
    expect(data.nodes.size).toBe(1);

    const A = data.nodes.get("A");
    expect(A.id).toBe("A");
    expect(A.name).toBe("A");
    expect(A.nodes.size).toBe(2);

    const B = A.nodes.get("A.B");
    expect(B.id).toBe("A.B");
    expect(B.name).toBe("B");
    expect(B.nodes.size).toBe(1);

    const C = B.nodes.get("A.B.C");
    expect(C.id).toBe("A.B.C");
    expect(C.name).toBe("C");
    expect(C.nodes.size).toBe(0);

    const One = A.nodes.get("A.1");
    expect(One.id).toBe("A.1");
    expect(One.name).toBe("1");
    expect(One.nodes.size).toBe(1);

    const Two = One.nodes.get("A.1.2");
    expect(Two.id).toBe("A.1.2");
    expect(Two.name).toBe("2");
    expect(Two.nodes.size).toBe(0);
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

    const { nodes } = thinkabletype.outlineData();
    expect(nodes.size).toBe(1); // C masquerades as A.B.C

    const A = nodes.get("A");
    expect(A.id).toBe("A");
    expect(A.name).toBe("A");
    expect(A.nodes.size).toBe(1);

    const B = A.nodes.get("A.B");
    expect(B.id).toBe("A.B");
    expect(B.name).toBe("B");
    expect(B.nodes.size).toBe(1);

    const C = B.nodes.get("A.B.C");
    expect(C.id).toBe("A.B.C");
    expect(C.name).toBe("C");
    expect(C.nodes.size).toBe(1);

    const D = C.nodes.get("C.D");
    expect(D.id).toBe("C.D");
    expect(D.name).toBe("D");
    expect(D.nodes.size).toBe(1);

    const E = D.nodes.get("C.D.E");
    expect(E.id).toBe("C.D.E");
    expect(E.name).toBe("E");
    expect(E.nodes.size).toBe(0);
});

test.only("fusion end", () => {
    const hyperedges = [
        // A.B.C && 1.2.C with C as fusion node
        ["A", "B", "C"],
        ["1", "2", "C"],
    ];

    const thinkabletype = new ThinkableType(hyperedges, {
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const data = thinkabletype.outlineData();
    expect(data.nodes.size).toBe(2); // C masquerades as A.B.C

    const A = data.nodes.get("A");
    expect(A.id).toBe("A");
    expect(A.name).toBe("A");
    expect(A.nodes.size).toBe(1);

    const B = A.nodes.get("A.B");
    expect(B.id).toBe("A.B");
    expect(B.name).toBe("B");
    expect(B.nodes.size).toBe(1);

    const C = B.nodes.get("A.B.C");
    expect(C.id).toBe("A.B.C");
    expect(C.name).toBe("C");
    expect(C.nodes.size).toBe(1);
    console.log("C", C.nodes);



    const One = data.nodes.get("1");
    expect(One.id).toBe("1");
    expect(One.name).toBe("1");
    expect(One.nodes.size).toBe(1);

    const Two = One.nodes.get("1.2");
    expect(Two.id).toBe("1.2");
    expect(Two.name).toBe("2");
    console.log("TWO", Two);
    expect(Two.nodes.size).toBe(1);

    // const C2 = Two.nodes.get("1.2.C");
    // expect(C2.id).toBe("1.2.C");
    // expect(C2.name).toBe("C");
    // expect(C2.nodes.size).toBe(0);

});

/*


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

test("two-edge fusion bridge regression", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B"],
        ],
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const graphData = thinkabletype.graphData();
    expect(graphData.nodes.length).toBe(2);
    expect(graphData.links.length).toBe(1);
});


*/
