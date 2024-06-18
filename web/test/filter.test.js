import GeneralSchematics from "@lib/generalschematics"

import { expect, test } from "vitest";

test("filter on isolated", () => {
    const schematic = new GeneralSchematics({
        interwingling: GeneralSchematics.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});


test("filter on multiple edges isolated", () => {
    const schematic = new GeneralSchematics({
        interwingling: GeneralSchematics.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = schematic.graphData([["A"], ["1"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});


test("filter on multiple overlapping edges isolated", () => {
    const schematic = new GeneralSchematics({
        interwingling: GeneralSchematics.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });
    const graphData = schematic.graphData([["C"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter edge fusion", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.DEEP,
        interwingle: GeneralSchematics.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
        ]
    });

    const graphData = schematic.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // fusion grabs connected C->D->E node
    expect(graphData.links.length).toBe(4);
});

test("filter edge confluence", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.DEEP,
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "1"],
        ]
    });

    const graphData = schematic.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(4); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(3);
});


test("filter edge bridge", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.DEEP,
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "vs", "2"],
            ["A", "vs", "B"],
        ]
    });

    const graphData = schematic.graphData([["1"]]);
    expect(graphData.nodes.length).toBe(7); // bridge graphs connected A vs B edge
    expect(graphData.links.length).toBe(6);
});

test("filter edge confluence shallow", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.SHALLOW,
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = schematic.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter edge confluence deep", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.DEEP,
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = schematic.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(4);
});

test("filter interwingle progression", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.DEEP,
        hyperedges: [
            ["A", "B", "2", "C"],
            ["C", "B", "1"],
            ["A", "Y", "Z"],
        ]
    });

    let graphData;

    schematic.interwingle = GeneralSchematics.INTERWINGLE.ISOLATED;
    graphData = schematic.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    schematic.interwingle = GeneralSchematics.INTERWINGLE.CONFLUENCE;
    graphData = schematic.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);

    schematic.interwingle = GeneralSchematics.INTERWINGLE.FUSION;
    graphData = schematic.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);

    schematic.interwingle = GeneralSchematics.INTERWINGLE.BRIDGE;
    graphData = schematic.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(9);
});

test("fusion meta hyperedge ids regression", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION,
        depth: GeneralSchematics.DEPTH.DEEP
    });
    schematic.add(["A", "B", "C"]);
    schematic.add(["C", "D", "E"]);
    schematic.add(["1", "2", "C"]);

    const graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("find no edges", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.SHALLOW,
        interwingle: GeneralSchematics.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    graphData = schematic.graphData([["A", "C"]]);
    expect(graphData.nodes.length).toBe(0);
    expect(graphData.links.length).toBe(0);
});

test("filter fusion depth", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);

    schematic.depth = 1;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);

    schematic.depth = 2;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);

    schematic.depth = 3;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);

    schematic.depth = 4;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(11);
    expect(graphData.links.length).toBe(10);

    schematic.depth = 5;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);

    schematic.depth = 6;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);

    schematic.depth = 7;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);

    schematic.depth = GeneralSchematics.DEPTH.DEEP;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
});

test("filter fusion depth regression", () => {
    const content = `
Ted Nelson -> invented -> HyperText
Tim Berners-Lee -> invented -> WWW
HyperText -> influenced -> WWW
Vannevar Bush -> author -> As We May Think
As We May Think -> influenced -> HyperText
Ted Nelson -> author -> Computer Lib/Dream Machines
Tim Berners-Lee -> author -> Weaving the Web
    `.trim();

    const schematic = new GeneralSchematics(content, { interwingle: GeneralSchematics.INTERWINGLE.FUSION });

    let graphData, symbols;
    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");

    schematic.depth = 1;
    graphData = schematic.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");

    schematic.depth = 2;
    graphData = schematic.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");
    expect(symbols).toContain("Vannevar Bush");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Tim Berners-Lee");
});

test("filter fusion multiple edge depth regression", () => {
    const content = `
Ted Nelson -> invented -> HyperText
Tim Berners-Lee -> invented -> WWW
HyperText -> influenced -> WWW
Vannevar Bush -> author -> As We May Think
As We May Think -> influenced -> HyperText
Ted Nelson -> author -> Computer Lib/Dream Machines
Tim Berners-Lee -> author -> Weaving the Web
    `.trim();

    const schematic = new GeneralSchematics(content, { interwingle: GeneralSchematics.INTERWINGLE.FUSION });

    let graphData, symbols;
    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("Tim Berners-Lee");

    schematic.depth = 1;
    graphData = schematic.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");
    expect(symbols).toContain("Weaving the Web");

    schematic.depth = 2;
    graphData = schematic.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");
    expect(symbols).toContain("WWW");
    expect(symbols).toContain("influenced");
    expect(symbols).toContain("As We May Think");
    expect(symbols).toContain("Weaving the Web");
    expect(symbols).toContain("Vannevar Bush");
});

test("filter bridge depth", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["C", "vs", "D"],
            ["E", "vs", "G"],
        ]
    });

    let graphData;

    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    schematic.depth = GeneralSchematics.DEPTH.DEEP;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(10);
    expect(graphData.links.length).toBe(9)
});

test("get max depth", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.SHALLOW,
        interwingle: GeneralSchematics.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
            ["E", "F", "G"],
            ["G", "H", "I"],
            ["I", "J", "K"],
            ["K", "L", "M"],
            ["M", "N", "O"],
            ["O", "P", "Q"],
        ]
    });

    let graphData;

    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 1;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 2;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
    expect(graphData.depth).toBe(2);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 3;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    expect(graphData.depth).toBe(3);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 4;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(11);
    expect(graphData.links.length).toBe(10);
    expect(graphData.depth).toBe(4);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 5;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);
    expect(graphData.depth).toBe(5);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 6;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);
    expect(graphData.depth).toBe(6);
    expect(graphData.maxDepth).toBe(7);

    schematic.depth = 7;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
    expect(graphData.depth).toBe(7);
    expect(graphData.maxDepth).toBe(7);
});

test("filter bridge depth missing node regression", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.SHALLOW,
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["1", "vs", "2"],
        ]
    });

    let graphData;

    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    schematic.depth = 1;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("max depth bridge regression", () => {
    const content = `
Ted Nelson -> invented -> HyperText
Tim Berners-Lee -> invented -> WWW
HyperText -> influenced -> WWW
Vannevar Bush -> author -> As We May Think
As We May Think -> influenced -> HyperText
Ted Nelson -> author -> Computer Lib/Dream Machines
Tim Berners-Lee -> author -> Weaving the Web
    `.trim();

    const schematic = new GeneralSchematics(content, { interwingle: GeneralSchematics.INTERWINGLE.BRIDGE });

    let graphData;
    schematic.depth = 0;
    graphData = schematic.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(12);
    expect(graphData.links.length).toBe(12);

    schematic.depth = 1;
    graphData = schematic.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(18);
    expect(graphData.links.length).toBe(21);

    schematic.depth = 2;
    graphData = schematic.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(18);
    expect(graphData.links.length).toBe(21);
});

test("filter maxDepth regression", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "2", "3"],
            ["A", "B", "1"]
        ]
    });

    let graphData;

    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);

    schematic.depth = 1;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    schematic.depth = 2;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    schematic.depth = GeneralSchematics.DEPTH.DEEP;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);
});

test("complex filter bridge max depth regression", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.DEEP,
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["X", "vs", "Y"],
        ]
    });

    let graphData;

    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    schematic.depth = GeneralSchematics.DEPTH.SHALLOW;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);
});

test("max depth collapse regression", () => {
    const schematic = new GeneralSchematics({
        depth: GeneralSchematics.DEPTH.SHALLOW,
        interwingle: GeneralSchematics.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["X", "vs", "Y"],
            ["Y", "2", "3"],
            ["3", "4", "5"],
            ["10", "4", "R"],
            ["Z", "T", "R"],
        ]
    });

    let graphData;

    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(5);

    schematic.depth = 1;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(5);

    schematic.depth = 2;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    expect(graphData.depth).toBe(2);
    expect(graphData.maxDepth).toBe(5);

    schematic.depth = 3;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(12);
    expect(graphData.links.length).toBe(11);
    expect(graphData.depth).toBe(3);
    expect(graphData.maxDepth).toBe(5);

    schematic.depth = 4;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);
    expect(graphData.depth).toBe(4);
    expect(graphData.maxDepth).toBe(5);

    schematic.depth = 5;
    graphData = schematic.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
    expect(graphData.depth).toBe(5);
    expect(graphData.maxDepth).toBe(5);
});

test("filter on symbol", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    expect(schematic.filter("A").length).toBe(1);
    expect(schematic.filter("B").length).toBe(1);
    expect(schematic.filter("1").length).toBe(1);
    expect(schematic.filter("2").length).toBe(1);
    expect(schematic.filter("C").length).toBe(2);
});

test("filter on partial edge", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "D"],
        ]
    });

    expect(schematic.filter(["A", "B"]).length).toBe(2);
    expect(schematic.filter(["A", "B", "C"]).length).toBe(1);
    expect(schematic.filter(["A", "B", "D"]).length).toBe(1);
});

test("filter on multiple edges", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "1"],
            ["A", "B", "2"],
        ]
    });

    expect(schematic.filter([["A", "B", "1"]]).length).toBe(1);
    expect(schematic.filter(["A", "B"]).length).toBe(2);
    expect(schematic.filter(["A", "B", "1"]).length).toBe(1);
    expect(schematic.filter([["A", "B", "1"], ["A", "B", "2"]]).length).toBe(2);
});

test("filter on explicit node", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const filter = [{ node: schematic.hyperedges[0].firstNode.uuid }];
    const graphData = schematic.graphData(filter);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter on explicit multiple nodes", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const filter = [
        { node: schematic.hyperedges[0].firstNode.uuid },
        { node: schematic.hyperedges[1].firstNode.uuid },
    ];
    const graphData = schematic.graphData(filter);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter on explicit hyperedge", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const filter = [{ edge: schematic.hyperedges[0].uuid }];
    const graphData = schematic.graphData(filter);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter on 2-node hyperedge", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION,
        depth: GeneralSchematics.DEPTH.SHALLOW,
        hyperedges: [
            ["A", "B", "C", "D"],
            ["A", "Z"],
        ]
    });

    const filter = [{ node: schematic.hyperedges[0].firstNode.uuid }];

    // has reference but not expanded out yet
    let graphData = schematic.graphData(filter);
    expect(graphData.nodes[0].nodeUUIDs.has(schematic.hyperedges[1].firstNode.uuid)).toBeTruthy();
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    // now it's expanded out
    schematic.depth = GeneralSchematics.DEPTH.DEEP;
    graphData = schematic.graphData(filter);
    expect(graphData.nodes[0].nodeUUIDs.has(schematic.hyperedges[1].firstNode.uuid)).toBeTruthy();
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
});
