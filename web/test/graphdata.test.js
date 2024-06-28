import GeneralSchematics from "@lib/generalschematics";

import { expect, test } from "vitest";

// TODO: Is there a smarter way to do indexes? Perhaps what we should do...is make them liveObjects...since we have to restore them anyway
//         is it possible to have live objects as graphData?
// TODO: Kinda of need to rethink General Schematic <-> Tree relationship. A lot of overlap. And pushing everything to tree
//        means we have to push graphData stuff there (unless we can do the above)


// ISOLATED

test("graph data (interwingle)", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
});

test("single hyperedge (isolate)", () => {
    const schematic = new GeneralSchematics([["A", "B", "C"]]);
    expect(schematic).toBeInstanceOf(GeneralSchematics);
    const hyperedge = schematic.hyperedges[0];
    expect(hyperedge.symbols).toEqual(["A", "B", "C"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("0:A->0:A.B");
    expect(data.links[0].source).toBe("0:A");
    expect(data.links[0].target).toBe("0:A.B");
    expect(data.links[0].hyperedges.length).toBe(1);
    expect(data.links[0].hyperedges[0]).toBe(hyperedge);
    expect(data.links[0].hyperedges[0].uuid).toBe(hyperedge.uuid);
    expect(data.links[0].hyperedges[0].id).toBe(hyperedge.id);

    expect(data.links[1].id).toBe("0:A.B->0:A.B.C");
    expect(data.links[1].source).toBe("0:A.B");
    expect(data.links[1].target).toBe("0:A.B.C");
    expect(data.links[1].hyperedges.length).toBe(1);
    expect(data.links[1].hyperedges[0]).toBe(hyperedge);
    expect(data.links[1].hyperedges[0].uuid).toBe(hyperedge.uuid);
    expect(data.links[1].hyperedges[0].id).toBe(hyperedge.id);
});

// CONFLUENCE

test("graph data (confluence)", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
});

test("single hyperedge (confluence)", () => {
    const schematic = new GeneralSchematics([["A", "B", "C"]], { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });
    expect(schematic).toBeInstanceOf(GeneralSchematics);
    expect(schematic.hyperedges[0].symbols).toEqual(["A", "B", "C"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    expect(data.links.length).toBe(2);
    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[0].source).toBe("A");
    expect(data.links[0].target).toBe("A.B");
    expect(data.links[0].hyperedges[0].id).toBe("A.B.C");

    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[1].source).toBe("A.B");
    expect(data.links[1].target).toBe("A.B.C");
    expect(data.links[1].hyperedges[0].id).toContain("A.B.C");
});

test("multiple hyperedge (confluence)", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["A", "1", "2"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE
    });

    const [edge1, edge2] = schematic.hyperedges;

    expect(schematic).toBeInstanceOf(GeneralSchematics);
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B", "C", "1", "2"]));

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("A->A.1");
    expect(data.links[3].id).toBe("A.1->A.1.2");

    expect(data.links[0].hyperedges).toContain(edge1);
    expect(data.links[1].hyperedges).toContain(edge1);
    expect(data.links[2].hyperedges).toContain(edge2);
    expect(data.links[3].hyperedges).toContain(edge2);
});

// FUSION

test("fusion start", () => {
    const hyperedges = [
        // A.B.C.D.E
        ["A", "B", "C"],
        ["C", "D", "E"]
    ];

    const schematic = new GeneralSchematics(hyperedges, {
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    expect(schematic.isFusion).toBeTruthy();
    expect(schematic.hyperedges.length).toEqual(2);

    const data = schematic.graphData();
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

    const schematic = new GeneralSchematics(hyperedges, {
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    expect(schematic.hyperedges.length).toEqual(2);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(5); // C masquerades as A.B.C
    expect(data.links.length).toBe(4);

    expect(data.links[0].id).toBe("A->A.B");
    expect(data.links[1].id).toBe("A.B->A.B.C");
    expect(data.links[2].id).toBe("1->1.2");
    expect(data.links[3].id).toBe("1.2->A.B.C");
});


test("fusion no bridge", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    schematic.add(["A", "B"]);
    schematic.add(["B", "C"]);
    schematic.add(["1", "B", "2"]);
    schematic.add(["3", "B", "4"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(9);
    expect(data.links.length).toBe(10);
});

test("two-edge start bridge", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    schematic.add(["1", "B", "2"]);
    schematic.add(["B", "C"]);

    const data = schematic.graphData();

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
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    schematic.add(["1", "B", "2"]);
    schematic.add(["A", "B"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});


test("continuous fusion", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    schematic.add(["A", "B"]);
    schematic.add(["B", "C"]);
    schematic.add(["C", "D"]);
    schematic.add(["D", "E"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two edge disconnected", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["B", "2"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);
});


test("two edge start connection", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["A", "1"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

test("two edge middle connection", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["B", "2"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});

test("two edge end connection", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["C", "3"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);
});


test("two edge multiple start connections", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "Y", "Z"],
            ["A", "B", "C"],
            ["1", "2", "3"],
            ["A", "1"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7); // would be 8 but A hits confluence node
});

test("two edge multiple middle connections", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["X", "Y", "Z"],
            ["A", "Y", "C"],
            ["1", "2", "3"],
            ["Y", "1"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
});

test("two edge multiple end connections", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["X", "Y", "Z"],
            ["A", "B", "Z"],
            ["1", "2", "3"],
            ["Z", "1"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);
});

test("two edge close loop", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["A", "C"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(3);
});


test("closed fusion loop", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    schematic.add(["A", "B", "C", "A"]);

    const data = schematic.graphData();

    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(3);
});


test("two two-edge connections", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    schematic.add(["A", "B", "C"]);
    schematic.add(["D", "A"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

// BRIDGE

test("bridge", () => {
    const hyperedges = [
        ["A", "vs", "B"],
        ["1", "vs", "2"],
    ];

    const schematic = new GeneralSchematics({
        hyperedges,
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE
    });

    expect(schematic.hyperedges.length).toEqual(2);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(7);
    expect(data.links.length).toBe(6);

    expect(data.links[0].id).toBe("A->A.vs");
    expect(data.links[1].id).toBe("A.vs->A.vs.B");
    expect(data.links[2].id).toBe("1->1.vs");
    expect(data.links[3].id).toBe("1.vs->1.vs.2");
    expect(data.links[4].id).toBe("vs#bridge->A.vs");
    expect(data.links[5].id).toBe("vs#bridge->1.vs");
});


test("two-edge end bridge incoming", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });
    schematic.add(["1", "B", "2"]);
    schematic.add(["A", "B"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

test("two-edge end bridge reverse order", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });
    schematic.add(["A", "B"]);
    schematic.add(["1", "B", "2"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(4);
    expect(data.links.length).toBe(3);
});

test("two-edge fusion skip bridge", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });
    schematic.add(["A", "B"]);
    schematic.add(["B", "C"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(3);
    expect(data.links.length).toBe(2);
});


test("two-edge confluence skip fusion and bridge", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });
    schematic.add(["A", "B"]);
    schematic.add(["B", "C"]);
    schematic.add(["B", "1", "2"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(5);
    expect(data.links.length).toBe(4);
});

test("two-edge fusion bridge", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });
    schematic.add(["A", "B"]);
    schematic.add(["B", "C"]);
    schematic.add(["1", "B", "2"]);
    schematic.add(["3", "B", "4"]);

    const data = schematic.graphData();
    expect(data.nodes.length).toBe(10);
    expect(data.links.length).toBe(12);
});

test("two-edge fusion bridge regression", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B"],
        ],
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const graphData = schematic.graphData();
    expect(graphData.nodes.length).toBe(2);
    expect(graphData.links.length).toBe(1);
});

test("custom colors", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["L", "M", "N"],
        ["X", "Y", "Z"],
    ], {
        colors: ["#000000"]
    });

    const data = schematic.graphData();
    for (const node of data.nodes) {
        expect(node.color).toBe("#000000");
    }
});

test.skip("restore node position", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ]);

    let oldData = schematic.graphData();
    oldData.nodes[0].x = 100;
    oldData.nodes[0].y = 100;
    oldData.nodes[0].z = 100;
    oldData.nodes[0].vx = 100;
    oldData.nodes[0].vy = 100;
    oldData.nodes[0].vz = 100;

    let newData = schematic.graphData(null, oldData);
    expect(oldData.nodes[0].id).toBe(newData.nodes[0].id);
    expect(newData.nodes[0].x).toBe(100);
    expect(newData.nodes[0].y).toBe(100);
    expect(newData.nodes[0].z).toBe(100);
    expect(newData.nodes[0].vx).toBe(100);
    expect(newData.nodes[0].vy).toBe(100);
    expect(newData.nodes[0].vz).toBe(100);
    expect(newData.nodes[0].uuid).toBe(oldData.nodes[0].uuid);
    expect(newData.nodes[1].uuid).toBe(oldData.nodes[1].uuid);
    expect(newData.nodes[2].uuid).toBe(oldData.nodes[2].uuid);
});

test.skip("restore node positions with parse", () => {
    const schematic = new GeneralSchematics("A -> B -> C");

    let oldData = schematic.graphData();
    oldData.nodes[0].x = 100;
    oldData.nodes[0].y = 100;
    oldData.nodes[0].z = 100;
    oldData.nodes[0].vx = 100;
    oldData.nodes[0].vy = 100;
    oldData.nodes[0].vz = 100;

    schematic.parse("A -> B -> C");

    let newData = schematic.graphData(null, oldData);

    expect(oldData.nodes[0].id).toBe(newData.nodes[0].id);
    expect(newData.nodes[0].uuid).toBe(oldData.nodes[0].uuid);
    expect(newData.nodes[1].uuid).toBe(oldData.nodes[1].uuid);
    expect(newData.nodes[2].uuid).toBe(oldData.nodes[2].uuid);
    expect(newData.nodes[0].x).toBe(100);
    expect(newData.nodes[0].y).toBe(100);
    expect(newData.nodes[0].z).toBe(100);
    expect(newData.nodes[0].vx).toBe(100);
    expect(newData.nodes[0].vy).toBe(100);
    expect(newData.nodes[0].vz).toBe(100);
});

test.skip("restore entire node", () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    let graphData;

    graphData = schematic.graphData();
    const [A, B, C] = graphData.nodes;

    expect(A === A).toBeTruthy();
    expect(B === B).toBeTruthy();
    expect(C === C).toBeTruthy();

    graphData = schematic.graphData(null, graphData);
    const [A1, B1, C1] = graphData.nodes;

    expect(A === A1).toBeTruthy();
    expect(B === B1).toBeTruthy();
    expect(C === C1).toBeTruthy();

});

test.skip("restore entire node with parse", () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    let graphData;

    graphData = schematic.graphData();
    const [A, B, C] = graphData.nodes;

    expect(A === A).toBeTruthy();
    expect(B === B).toBeTruthy();
    expect(C === C).toBeTruthy();

    schematic.parse("A -> B -> C");

    graphData = schematic.graphData(null, graphData);
    const [A1, B1, C1] = graphData.nodes;

    expect(A === A1).toBeTruthy();
    expect(B === B1).toBeTruthy();
    expect(C === C1).toBeTruthy();
});

test.skip("restore entire node with new information", () => {
    const schematic = new GeneralSchematics("A -> B -> C\nHypertext for A");
    let graphData;

    graphData = schematic.graphData();
    const [A, B, C] = graphData.nodes;

    expect(A === A).toBeTruthy();
    expect(B === B).toBeTruthy();
    expect(C === C).toBeTruthy();
    expect(schematic.nodes[0].hypertexts.length).toBe(1);

    schematic.parse("A -> B -> C");

    graphData = schematic.graphData(null, graphData);
    const [A1, B1, C1] = graphData.nodes;

    expect(A === A1).toBeTruthy();
    expect(B === B1).toBeTruthy();
    expect(C === C1).toBeTruthy();
    expect(schematic.nodes[0].hypertexts.length).toBe(0);
});

test.skip("restore node positions with parse and interwingle change", () => {
    const schematic = new GeneralSchematics("A -> B -> C");

    let data, oldData;

    data = schematic.graphData();
    data.nodes[0].x = 100;
    data.nodes[0].y = 100;
    data.nodes[0].z = 100;
    data.nodes[0].vx = 100;
    data.nodes[0].vy = 100;
    data.nodes[0].vz = 100;
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");

    expect(data.nodes[0].uid).toBe("0:A");
    expect(data.nodes[1].uid).toBe("0:A.B");
    expect(data.nodes[2].uid).toBe("0:A.B.C");

    oldData = data;
    schematic.interwingle = GeneralSchematics.INTERWINGLE.CONFLUENCE;
    data = schematic.graphData(null, oldData);
    expect(oldData.nodes[0].uid).toBe(data.nodes[0].uid);
    expect(data.nodes[0].uuid).toBe(oldData.nodes[0].uuid);
    expect(data.nodes[1].uuid).toBe(oldData.nodes[1].uuid);
    expect(data.nodes[2].uuid).toBe(oldData.nodes[2].uuid);
    expect(data.nodes[0].x).toBe(100);
    expect(data.nodes[0].y).toBe(100);
    expect(data.nodes[0].z).toBe(100);
    expect(data.nodes[0].vx).toBe(100);
    expect(data.nodes[0].vy).toBe(100);
    expect(data.nodes[0].vz).toBe(100);
    expect(data.nodes[0].uid).toBe("0:A");
    expect(data.nodes[1].uid).toBe("0:A.B");
    expect(data.nodes[2].uid).toBe("0:A.B.C");
    expect(data.nodes[0].id).toBe("A");
    expect(data.nodes[1].id).toBe("A.B");
    expect(data.nodes[2].id).toBe("A.B.C");

    oldData = data;
    schematic.interwingle = GeneralSchematics.INTERWINGLE.ISOLATED;
    data = schematic.graphData(null, oldData);
    expect(oldData.nodes[0].uid).toBe(data.nodes[0].uid);
    expect(data.nodes[0].uuid).toBe(oldData.nodes[0].uuid);
    expect(data.nodes[1].uuid).toBe(oldData.nodes[1].uuid);
    expect(data.nodes[2].uuid).toBe(oldData.nodes[2].uuid);
    expect(data.nodes[0].x).toBe(100);
    expect(data.nodes[0].y).toBe(100);
    expect(data.nodes[0].z).toBe(100);
    expect(data.nodes[0].vx).toBe(100);
    expect(data.nodes[0].vy).toBe(100);
    expect(data.nodes[0].vz).toBe(100);
    expect(data.nodes[0].uid).toBe("0:A");
    expect(data.nodes[1].uid).toBe("0:A.B");
    expect(data.nodes[2].uid).toBe("0:A.B.C");
    expect(data.nodes[0].id).toBe("0:A");
    expect(data.nodes[1].id).toBe("0:A.B");
    expect(data.nodes[2].id).toBe("0:A.B.C");
});

// 

test.skip("single node edge", () => { // TODO: this is a bug with new markdown parser. can't tell a single symbol from a hyperedge from a hypertext
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.ISOLATED });
    schematic.add(["A"]);
    const data = schematic.graphData();
    expect(data.nodes.length).toBe(1);
});



// Interwingle change should not affect graphData


// TODO: restore entire node, with new data
// TODO: do links need to be restored as well?