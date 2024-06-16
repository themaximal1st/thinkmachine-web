import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";

test("filter on isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});


test("filter on multiple edges isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const graphData = thinkabletype.graphData([["A"], ["1"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});


test("filter on multiple overlapping edges isolated", () => {
    const thinkabletype = new ThinkableType({
        interwingling: ThinkableType.INTERWINGLE.ISOLATED,
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });
    const graphData = thinkabletype.graphData([["C"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter edge fusion", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        hyperedges: [
            ["A", "B", "C"],
            ["C", "D", "E"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // fusion grabs connected C->D->E node
    expect(graphData.links.length).toBe(4);
});

test("filter edge confluence", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(4); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(3);
});


test("filter edge bridge", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "vs", "2"],
            ["A", "vs", "B"],
        ]
    });

    const graphData = thinkabletype.graphData([["1"]]);
    expect(graphData.nodes.length).toBe(7); // bridge graphs connected A vs B edge
    expect(graphData.links.length).toBe(6);
});

test("filter edge confluence shallow", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter edge confluence deep", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        hyperedges: [
            ["A", "B", "C"],
            ["A", "2", "1"],
        ]
    });

    const graphData = thinkabletype.graphData([["A", "B", "C"]]);
    expect(graphData.nodes.length).toBe(5); // confluence grabs connected A->B->1 edge
    expect(graphData.links.length).toBe(4);
});

test("filter interwingle progression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        hyperedges: [
            ["A", "B", "2", "C"],
            ["C", "B", "1"],
            ["A", "Y", "Z"],
        ]
    });

    let graphData;

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.ISOLATED;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.CONFLUENCE;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(5);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.FUSION;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(8);
    expect(graphData.links.length).toBe(7);

    thinkabletype.interwingle = ThinkableType.INTERWINGLE.BRIDGE;
    graphData = thinkabletype.graphData([["2"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(9);
});

test("fusion meta hyperedge ids regression", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        depth: ThinkableType.DEPTH.DEEP
    });
    thinkabletype.add(["A", "B", "C"]);
    thinkabletype.add(["C", "D", "E"]);
    thinkabletype.add(["1", "2", "C"]);

    const graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("find no edges", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
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

    graphData = thinkabletype.graphData([["A", "C"]]);
    expect(graphData.nodes.length).toBe(0);
    expect(graphData.links.length).toBe(0);
});

test("filter fusion depth", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION,
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

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);

    thinkabletype.depth = 3;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);

    thinkabletype.depth = 4;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(11);
    expect(graphData.links.length).toBe(10);

    thinkabletype.depth = 5;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);

    thinkabletype.depth = 6;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);

    thinkabletype.depth = 7;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);

    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
});

test("filter fusion depth regression", () => {
    const content = `
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
Vannevar Bush,author,As We May Think
As We May Think,influenced,HyperText
Ted Nelson,author,Computer Lib/Dream Machines
Tim Berners-Lee,author,Weaving the Web
    `.trim();

    const thinkabletype = ThinkableType.parse(content, { interwingle: ThinkableType.INTERWINGLE.FUSION });

    let graphData, symbols;
    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["Ted Nelson"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    symbols = graphData.nodes.map(node => node.name);
    expect(symbols).toContain("Ted Nelson");
    expect(symbols).toContain("invented");
    expect(symbols).toContain("HyperText");
    expect(symbols).toContain("author");
    expect(symbols).toContain("Computer Lib/Dream Machines");

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["Ted Nelson"]]);
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

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["Ted Nelson"]]);
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
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
Vannevar Bush,author,As We May Think
As We May Think,influenced,HyperText
Ted Nelson,author,Computer Lib/Dream Machines
Tim Berners-Lee,author,Weaving the Web
    `.trim();

    const thinkabletype = ThinkableType.parse(content, { interwingle: ThinkableType.INTERWINGLE.FUSION });

    let graphData, symbols;
    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
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

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
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

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
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
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["C", "vs", "D"],
            ["E", "vs", "G"],
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(10);
    expect(graphData.links.length).toBe(9)
});

test("get max depth", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.FUSION,
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

    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
    expect(graphData.depth).toBe(2);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 3;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    expect(graphData.depth).toBe(3);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 4;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(11);
    expect(graphData.links.length).toBe(10);
    expect(graphData.depth).toBe(4);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 5;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(13);
    expect(graphData.links.length).toBe(12);
    expect(graphData.depth).toBe(5);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 6;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);
    expect(graphData.depth).toBe(6);
    expect(graphData.maxDepth).toBe(7);

    thinkabletype.depth = 7;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
    expect(graphData.depth).toBe(7);
    expect(graphData.maxDepth).toBe(7);
});

test("filter bridge depth missing node regression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["1", "vs", "2"],
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
});

test("max depth bridge regression", () => {
    const content = `
Ted Nelson,invented,HyperText
Tim Berners-Lee,invented,WWW
HyperText,influenced,WWW
Vannevar Bush,author,As We May Think
As We May Think,influenced,HyperText
Ted Nelson,author,Computer Lib/Dream Machines
Tim Berners-Lee,author,Weaving the Web
    `.trim();

    const thinkabletype = ThinkableType.parse(content, { interwingle: ThinkableType.INTERWINGLE.BRIDGE });

    let graphData;
    thinkabletype.depth = 0;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(12);
    expect(graphData.links.length).toBe(12);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(18);
    expect(graphData.links.length).toBe(21);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["Ted Nelson"], ["WWW"]]);
    expect(graphData.maxDepth).toBe(1);
    expect(graphData.nodes.length).toBe(18);
    expect(graphData.links.length).toBe(21);
});

test("filter maxDepth regression", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["1", "2", "3"],
            ["A", "B", "1"]
        ]
    });

    let graphData;

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);
});

test("complex filter bridge max depth regression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.DEEP,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
        hyperedges: [
            ["A", "vs", "B"],
            ["X", "vs", "Y"],
        ]
    });

    let graphData;

    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(1);

    thinkabletype.depth = ThinkableType.DEPTH.SHALLOW;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(1);
});

test("max depth collapse regression", () => {
    const thinkabletype = new ThinkableType({
        depth: ThinkableType.DEPTH.SHALLOW,
        interwingle: ThinkableType.INTERWINGLE.BRIDGE,
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

    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);
    expect(graphData.depth).toBe(0);
    expect(graphData.maxDepth).toBe(5);

    thinkabletype.depth = 1;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(7);
    expect(graphData.links.length).toBe(6);
    expect(graphData.depth).toBe(1);
    expect(graphData.maxDepth).toBe(5);

    thinkabletype.depth = 2;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(9);
    expect(graphData.links.length).toBe(8);
    expect(graphData.depth).toBe(2);
    expect(graphData.maxDepth).toBe(5);

    thinkabletype.depth = 3;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(12);
    expect(graphData.links.length).toBe(11);
    expect(graphData.depth).toBe(3);
    expect(graphData.maxDepth).toBe(5);

    thinkabletype.depth = 4;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(15);
    expect(graphData.links.length).toBe(14);
    expect(graphData.depth).toBe(4);
    expect(graphData.maxDepth).toBe(5);

    thinkabletype.depth = 5;
    graphData = thinkabletype.graphData([["A"]]);
    expect(graphData.nodes.length).toBe(17);
    expect(graphData.links.length).toBe(16);
    expect(graphData.depth).toBe(5);
    expect(graphData.maxDepth).toBe(5);
});

test("filter on symbol", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    expect(thinkabletype.filter("A").length).toBe(1);
    expect(thinkabletype.filter("B").length).toBe(1);
    expect(thinkabletype.filter("1").length).toBe(1);
    expect(thinkabletype.filter("2").length).toBe(1);
    expect(thinkabletype.filter("C").length).toBe(2);
});

test("filter on partial edge", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["A", "B", "D"],
        ]
    });

    expect(thinkabletype.filter(["A", "B"]).length).toBe(2);
    expect(thinkabletype.filter(["A", "B", "C"]).length).toBe(1);
    expect(thinkabletype.filter(["A", "B", "D"]).length).toBe(1);
});

test("filter on multiple edges", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "1"],
            ["A", "B", "2"],
        ]
    });

    expect(thinkabletype.filter([["A", "B", "1"]]).length).toBe(1);
    expect(thinkabletype.filter(["A", "B"]).length).toBe(2);
    expect(thinkabletype.filter(["A", "B", "1"]).length).toBe(1);
    expect(thinkabletype.filter([["A", "B", "1"], ["A", "B", "2"]]).length).toBe(2);
});

test("filter on explicit node", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const filter = [{ node: thinkabletype.hyperedges[0].firstNode.uuid }];
    const graphData = thinkabletype.graphData(filter);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter on explicit multiple nodes", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const filter = [
        { node: thinkabletype.hyperedges[0].firstNode.uuid },
        { node: thinkabletype.hyperedges[1].firstNode.uuid },
    ];
    const graphData = thinkabletype.graphData(filter);
    expect(graphData.nodes.length).toBe(6);
    expect(graphData.links.length).toBe(4);
});

test("filter on explicit hyperedge", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["1", "2", "C"],
        ]
    });

    const filter = [{ edge: thinkabletype.hyperedges[0].uuid }];
    const graphData = thinkabletype.graphData(filter);
    expect(graphData.nodes.length).toBe(3);
    expect(graphData.links.length).toBe(2);
});

test("filter on 2-node hyperedge", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION,
        depth: ThinkableType.DEPTH.SHALLOW,
        hyperedges: [
            ["A", "B", "C", "D"],
            ["A", "Z"],
        ]
    });

    const filter = [{ node: thinkabletype.hyperedges[0].firstNode.uuid }];

    // has reference but not expanded out yet
    let graphData = thinkabletype.graphData(filter);
    expect(graphData.nodes[0].nodeUUIDs.has(thinkabletype.hyperedges[1].firstNode.uuid)).toBeTruthy();
    expect(graphData.nodes.length).toBe(4);
    expect(graphData.links.length).toBe(3);

    // now it's expanded out
    thinkabletype.depth = ThinkableType.DEPTH.DEEP;
    graphData = thinkabletype.graphData(filter);
    expect(graphData.nodes[0].nodeUUIDs.has(thinkabletype.hyperedges[1].firstNode.uuid)).toBeTruthy();
    expect(graphData.nodes.length).toBe(5);
    expect(graphData.links.length).toBe(4);
});
