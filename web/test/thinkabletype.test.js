import ThinkableType from "@lib/thinkabletype";
const Hyperedge = ThinkableType.Hyperedge;

import { expect, test } from "vitest";

test("initialize with hyperedge", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
});


test("initialize with hyperedges", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["1", "2", "3"],
    ]);

    expect(thinkabletype.hyperedges.length).toBe(2);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
    expect(thinkabletype.hyperedges[1].symbols).toEqual(["1", "2", "3"]);
    expect(thinkabletype.hyperedges[1].nodes.length).toBe(3);
});

test("add to hyperdge", () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add(["A", "B", "C"]);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(thinkabletype.hyperedges[0].nodes.length).toBe(3);
});

test("node uuid", () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add(["A", "B", "C"]);
    const edge = thinkabletype.hyperedges[0];
    const node = edge.nodes[0];
    expect(node.id).toBe("0:A");
    expect(node.uuid).toMatch(/^[0-9a-f-]{36}$/);
});

test("rename node", () => {
    const thinkabletype = new ThinkableType([["A", "B", "C"]]);
    const edge = thinkabletype.hyperedges[0];
    const node = edge.nodes[0];
    node.rename("A1");
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["A1", "B", "C"]);
});

test("remove node", () => {
    const thinkabletype = new ThinkableType([["A", "B", "C"]]);
    const edge = thinkabletype.hyperedges[0];

    edge.nodes[0].remove();
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["B", "C"]);

    edge.nodes[1].remove();
    expect(thinkabletype.hyperedges[0].symbols).toEqual(["B"]);

    edge.nodes[0].remove(); // removes hyperedge too
    expect(thinkabletype.hyperedges.length).toBe(0);
});

test("node uuid", () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add(["A", "B", "C"]);
    const uuid = thinkabletype.hyperedges[0].nodes[0].uuid;
    const node = thinkabletype.nodeByUUID(uuid);
    expect(node.id).toBe("0:A");
    expect(node.uuid).toMatch(uuid);
});

test("edge uuid", () => {
    const thinkabletype = new ThinkableType();
    thinkabletype.add(["A", "B", "C"]);
    const uuid = thinkabletype.hyperedges[0].uuid;
    const edge = thinkabletype.edgeByUUID(uuid);
    expect(edge.id).toBe("0:A.B.C");
    expect(edge.uuid).toMatch(uuid);
});

test("custom colors", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
            ["L", "M", "N"],
            ["X", "Y", "Z"],
        ],
        colors: ["#000000"],
    });

    const data = thinkabletype.graphData();
    for (const node of data.nodes) {
        expect(node.color).toBe("#000000");
    }
});

test("empty thinkabletype", () => {
    const thinkabletype = new ThinkableType();
    expect(thinkabletype.hyperedges).toEqual([]);
});

test("build edge (isolated)", () => {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["A", "B"]);
    expect(edge).instanceOf(Hyperedge);
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("0:A.B");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge.add("C");
    expect(edge.symbols).toEqual(["A", "B", "C"]);
    expect(edge.id).toEqual("0:A.B.C");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));

    const edge2 = thinkabletype.get(["A", "B", "C"]);
    expect(edge2).instanceOf(Hyperedge);

    edge2.nodes[2].remove();
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("0:A.B");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge2.removeIndex(0)
    expect(edge.symbols).toEqual(["B"]);
    expect(edge.id).toEqual("0:B");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["B"]));
});


test("build edge (confluence)", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });
    const edge = thinkabletype.add(["A", "B"]);
    expect(edge).instanceOf(Hyperedge);
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("A.B");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge.add("C");
    expect(edge.symbols).toEqual(["A", "B", "C"]);
    expect(edge.id).toEqual("A.B.C");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));

    const edge2 = thinkabletype.get(["A", "B", "C"]);
    expect(edge2).instanceOf(Hyperedge);

    edge2.removeIndex(2);
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("A.B");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge2.removeIndex(0)
    expect(edge.symbols).toEqual(["B"]);
    expect(edge.id).toEqual("B");
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["B"]));
});


test("edge dupes (fusion)", () => {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.FUSION });
    const edge1 = thinkabletype.add(["A", "B"]);
    const edge2 = thinkabletype.add(["A", "B"]);
    expect(edge1.id).toBe(edge2.id);
});

test("init with edges", () => {
    const hyperedges = [
        ["A", "B"],
    ];

    const thinkabletype = new ThinkableType({ hyperedges });
    expect(thinkabletype.hyperedges.length).toBe(1);
});

test("has node", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B"],
        ]
    });

    expect(thinkabletype.has("A")).toBeTruthy();
    expect(thinkabletype.has("B")).toBeTruthy();
    expect(thinkabletype.has("C")).toBeFalsy();
});

test("has partial edge", () => {
    const thinkabletype = new ThinkableType({
        hyperedges: [
            ["A", "B", "C"],
        ]
    });

    expect(thinkabletype.has(["A", "B"])).toBeTruthy();
    expect(thinkabletype.has(["B", "C"])).toBeTruthy();
    expect(thinkabletype.has(["A", "B", "C"])).toBeTruthy();
    expect(thinkabletype.has(["A", "C"])).toBeFalsy();
    expect(thinkabletype.has(["A", "B", "C", "D"])).toBeFalsy();
});

test("regression hyperedge id() collision", async function () {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["HELLO", "WORLD"]);

    expect(thinkabletype.has(["H"])).toBeFalsy();
    expect(edge.has("HELLO")).toBeTruthy();
    expect(edge.has(["H"])).toBeFalsy();
    expect(edge.has(["O", "W"])).toBeFalsy(); // regression
});

test("equal", async function () {
    const thinkabletype = new ThinkableType();
    const hyperedge1 = thinkabletype.add(["A", "B", "C"]);
    const hyperedge2 = thinkabletype.add(["A", "B", "C"]);
    const hyperedge3 = thinkabletype.add(["A", "B", "C", "D"]);

    expect(hyperedge1.nodes[0].equal(hyperedge1.nodes[0])).toBeTruthy();
    expect(hyperedge1.nodes[0].equal(hyperedge1.nodes[1])).toBeFalsy();

    expect(hyperedge1.equal(hyperedge1)).toBeTruthy();
    expect(hyperedge1.equal(hyperedge2)).toBeFalsy();
    expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("compare hyperedge (confluence)", async function () {
    const thinkabletype = new ThinkableType({ interwingle: ThinkableType.INTERWINGLE.CONFLUENCE });
    const hyperedge1 = thinkabletype.add(["A", "B", "C"]);
    const hyperedge2 = thinkabletype.add(["A", "B", "C"]);
    const hyperedge3 = thinkabletype.add(["A", "B", "C", "D"]);

    expect(hyperedge1.equal(hyperedge2)).toBeTruthy();
    expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("parses thinkabletype", async function () {
    const thinkabletype = ThinkableType.parse(`A,B,C
A,B,D`);
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.uniqueSymbols.size == 4).toBeTruthy();
    expect(thinkabletype.hyperedges.length == 2).toBeTruthy();
    expect(thinkabletype.has(["A", "B", "C"])).toBeTruthy();
    expect(thinkabletype.has(["A", "B", "D"])).toBeTruthy();
});

test("parses comma in thinkabletype", async function () {
    const thinkabletype = ThinkableType.parse(`thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."`);
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    expect(thinkabletype.uniqueSymbols.size == 3).toBeTruthy();
    expect(thinkabletype.hyperedges.length == 1).toBeTruthy();
    expect(thinkabletype.has("thinkabletype")).toBeTruthy();
    expect(thinkabletype.has("tagline")).toBeTruthy();
    expect(thinkabletype.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();
});

test("reset", async function () {
    const thinkabletype = ThinkableType.parse(`thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."`);
    expect(thinkabletype).toBeInstanceOf(ThinkableType);
    thinkabletype.reset();
    expect(thinkabletype.uniqueSymbols.size).toBe(0);
    expect(thinkabletype.hyperedges.length).toBe(0);
    expect(thinkabletype.has("thinkabletype")).toBeFalsy();
    expect(thinkabletype.has("tagline")).toBeFalsy();
    expect(thinkabletype.has("Turning C,S,V,s into Hypergraphs.")).toBeFalsy();
});

test("remove hyperedge", async function () {
    const thinkabletype = ThinkableType.parse(`A,B,C\r\n1,2,3`);
    expect(thinkabletype);
    expect(thinkabletype.uniqueSymbols.size).toBe(6);
    expect(thinkabletype.hyperedges.length).toBe(2);
    expect(thinkabletype.has(["A", "B", "C"])).toBeTruthy();
    thinkabletype.get(["A", "B", "C"]).remove();
    expect(thinkabletype.has(["A", "B", "C"])).toBeFalsy();
    expect(thinkabletype.uniqueSymbols.size).toBe(3);
    expect(thinkabletype.hyperedges.length).toBe(1);
});

test("export", async function () {
    const input = `thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."\nA,B,C,D,E,F,G`;
    const thinkabletype = ThinkableType.parse(input);
    expect(thinkabletype.uniqueSymbols.size).toBe(10);
    expect(thinkabletype.hyperedges.length).toBe(2);

    const output = thinkabletype.export();
    expect(input).toBe(output);

    thinkabletype.reset();
    thinkabletype.parse(output);
    expect(thinkabletype.uniqueSymbols.size).toBe(10);
    expect(thinkabletype.hyperedges.length).toBe(2);
});

test("parse on existing hypergraph", async function () {
    const input = `thinkabletype,tagline,"Turning C,S,V,s into Hypergraphs."\nA,B,C,D,E,F,G`;
    const thinkabletype = new ThinkableType();
    thinkabletype.parse(input);

    expect(thinkabletype.uniqueSymbols.size).toBe(10);
    expect(thinkabletype.hyperedges.length).toBe(2);
    expect(thinkabletype.has("thinkabletype")).toBeTruthy();
    expect(thinkabletype.has("tagline")).toBeTruthy();
    expect(thinkabletype.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();

    thinkabletype.parse(`A,B,C\n1,2,3`); // don't reset
    expect(thinkabletype.uniqueSymbols.size).toBe(13);
    expect(thinkabletype.hyperedges.length).toBe(4);
    expect(thinkabletype.has("thinkabletype")).toBeTruthy();
    expect(thinkabletype.has("1")).toBeTruthy();
});


test("hyperedge has", () => {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["A", "B", "C"]);
    expect(edge.has("A")).toBeTruthy();
    expect(edge.has(["A"])).toBeTruthy();

    expect(edge.has("B")).toBeTruthy();
    expect(edge.has(["B"])).toBeTruthy();

    expect(edge.has("C")).toBeTruthy();
    expect(edge.has(["C"])).toBeTruthy();

    expect(edge.has("A", "B")).toBeTruthy();
    expect(edge.has(["A", "B"])).toBeTruthy();

    expect(edge.has("B", "C")).toBeTruthy();
    expect(edge.has(["B", "C"])).toBeTruthy();

    expect(edge.has("A", "C")).toBeTruthy();
    expect(edge.has(["A", "C"])).toBeFalsy();
});

test("restore node position", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    let oldData = thinkabletype.graphData();
    oldData.nodes[0].x = 100;
    oldData.nodes[0].y = 100;
    oldData.nodes[0].z = 100;
    oldData.nodes[0].vx = 100;
    oldData.nodes[0].vy = 100;
    oldData.nodes[0].vz = 100;

    let newData = thinkabletype.graphData(null, oldData);
    expect(oldData.nodes[0].id).toBe(newData.nodes[0].id);
    expect(newData.nodes[0].x).toBe(100);
    expect(newData.nodes[0].y).toBe(100);
    expect(newData.nodes[0].z).toBe(100);
    expect(newData.nodes[0].vx).toBe(100);
    expect(newData.nodes[0].vy).toBe(100);
    expect(newData.nodes[0].vz).toBe(100);
});

test("insert node at index", () => {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["A", "B", "C"]);
    expect(edge.symbols).toEqual(["A", "B", "C"]);

    edge.addAtIndex("1", 0);
    expect(edge.symbols).toEqual(["1", "A", "B", "C"]);

    edge.addAtIndex("2", 2);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "C"]);

    edge.addAtIndex("3", 4);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C"]);

    edge.addAtIndex("4", 6);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C", "4"]);

    edge.addAtIndex("5", 10);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C", "4", "5"]);
});

test("add to node", () => {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["A", "B", "C"]);
    const [A, B, C] = edge.nodes;
    expect(edge.symbols).toEqual(["A", "B", "C"]);

    A.add("1");
    expect(edge.symbols).toEqual(["A", "1", "B", "C"]);

    B.add("2");
    expect(edge.symbols).toEqual(["A", "1", "B", "2", "C"]);

    C.add("3");
    expect(edge.symbols).toEqual(["A", "1", "B", "2", "C", "3"]);
});

test("insert to node", () => {
    const thinkabletype = new ThinkableType();
    const edge = thinkabletype.add(["A", "B", "C"]);
    const [A, B, C] = edge.nodes;
    expect(edge.symbols).toEqual(["A", "B", "C"]);

    A.insert("1");
    expect(edge.symbols).toEqual(["1", "A", "B", "C"]);

    B.insert("2");
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "C"]);

    C.insert("3");
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C"]);

    edge.add("4");
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C", "4"]);
});

test("connect nodes start", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const edge1 = thinkabletype.add(["A", "B", "C"]);
    const edge2 = thinkabletype.add(["1", "2", "3"]);

    const A = edge1.firstNode;
    const One = edge2.firstNode;

    expect(thinkabletype.hyperedges.length).toBe(2);
    A.connect(One);
    expect(thinkabletype.hyperedges.length).toBe(3);
    expect(thinkabletype.hyperedges[2].symbols).toEqual(["A", "1"]);
});

test("connect nodes middle", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const edge1 = thinkabletype.add(["A", "B", "C"]);
    const edge2 = thinkabletype.add(["1", "2", "3"]);

    const B = edge1.secondNode
    const Two = edge2.secondNode

    expect(thinkabletype.hyperedges.length).toBe(2);
    B.connect(Two);
    expect(thinkabletype.hyperedges.length).toBe(3);
    expect(thinkabletype.hyperedges[2].symbols).toEqual(["B", "2"]);
});

test("connect nodes end", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const edge1 = thinkabletype.add(["A", "B", "C"]);
    const edge2 = thinkabletype.add(["1", "2", "3"]);

    const C = edge1.lastNode;
    const Three = edge2.lastNode;

    expect(thinkabletype.hyperedges.length).toBe(2);
    C.connect(Three);
    expect(thinkabletype.hyperedges.length).toBe(3);
    expect(thinkabletype.hyperedges[2].symbols).toEqual(["C", "3"]);
});

test("connect nodes partial", () => {
    const thinkabletype = new ThinkableType({
        interwingle: ThinkableType.INTERWINGLE.FUSION
    });

    const edge1 = thinkabletype.add(["A", "B", "C"]);
    const edge2 = thinkabletype.add(["1", "2", "3"]);

    const B = edge1.secondNode;
    const One = edge2.firstNode;

    expect(thinkabletype.hyperedges.length).toBe(2);
    B.connect(One);
    expect(thinkabletype.hyperedges.length).toBe(3);
    expect(thinkabletype.hyperedges[2].symbols).toEqual(["B", "1"]);
});


/*
test.skip("huge", async () => {
    const fs = require("fs");
    const hyperedges = fs
        .readFileSync("/Users/brad/Projects/loom/data/data.thinkabletype", "utf-8")
        .split("\n")
        // .slice(0, 1800)
        .map((line) => {
            return line.split(" -> ");
        });

    const start = Date.now();
    const thinkabletype = new ThinkableType({ hyperedges, interwingle: ThinkableType.INTERWINGLE.BRIDGE });
    // await thinkabletype.sync();
    const data = thinkabletype.graphData();
    const elapsed = Date.now() - start;
    console.log("elapsed", elapsed);

    // console.log(data);
});
*/