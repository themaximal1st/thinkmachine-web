import GeneralSchematics from "@lib/generalschematics"
const Hyperedge = GeneralSchematics.Hypergraph.Hyperedge;

import { inspect } from "unist-util-inspect"
import { expect, test, beforeAll } from "vitest";

test("parse interwingle isolated", async () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.hyperedges.length).toBe(1);
    const [A, B, C] = schematic.hyperedges[0].nodes;
    expect(A.value).toBe("A");
    expect(A.id).toBe("0:A");
    expect(B.value).toBe("B");
    expect(B.id).toBe("0:A.B");
    expect(C.value).toBe("C");
    expect(C.id).toBe("0:A.B.C");

    schematic.hypergraph.add(["D", "E", "F"]);
    const [D, E, F] = schematic.hyperedges[1].nodes;
    expect(D.value).toBe("D");
    expect(D.id).toBe("1:D");
    expect(E.value).toBe("E");
    expect(E.id).toBe("1:D.E");
    expect(F.value).toBe("F");
    expect(F.id).toBe("1:D.E.F");
});

test("parse interwingle confluence", async () => {
    const schematic = new GeneralSchematics("A -> B -> C", { interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });
    expect(schematic.hyperedges.length).toBe(1);
    const [A, B, C] = schematic.hyperedges[0].nodes;
    expect(A.value).toBe("A");
    expect(A.id).toBe("A");
    expect(B.value).toBe("B");
    expect(B.id).toBe("A.B");
    expect(C.value).toBe("C");
    expect(C.id).toBe("A.B.C");

    schematic.hypergraph.add(["A", "1", "2"]);
    const [A1, One, Two] = schematic.hyperedges[1].nodes;
    expect(A1.value).toBe("A");
    expect(A1.id).toBe("A");
    expect(One.value).toBe("1");
    expect(One.id).toBe("A.1");
    expect(Two.value).toBe("2");
    expect(Two.id).toBe("A.1.2");
});

test("initialize with hyperedge", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ]);

    expect(schematic.hyperedges.length).toBe(1);
    expect(schematic.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(schematic.hyperedges[0].nodes.length).toBe(3);
});


test("initialize with hyperedges", () => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
        ["1", "2", "3"],
    ]);

    expect(schematic.hyperedges.length).toBe(2);
    expect(schematic.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(schematic.hyperedges[0].nodes.length).toBe(3);
    expect(schematic.hyperedges[1].symbols).toEqual(["1", "2", "3"]);
    expect(schematic.hyperedges[1].nodes.length).toBe(3);
});

test("add to hyperdge", () => {
    const schematic = new GeneralSchematics();
    schematic.add(["A", "B", "C"]);
    expect(schematic.hyperedges.length).toBe(1);
    expect(schematic.hyperedges[0].symbols).toEqual(["A", "B", "C"]);
    expect(schematic.hyperedges[0].nodes.length).toBe(3);
});

test("node uuid", () => {
    const schematic = new GeneralSchematics();
    schematic.add(["A", "B", "C"]);
    const edge = schematic.hyperedges[0];
    const node = edge.nodes[0];
    expect(node.id).toBe("0:A");
    expect(node.uuid).toMatch(/^[0-9a-f-]{36}$/);
});

test("rename node", () => {
    const schematic = new GeneralSchematics([["A", "B", "C"]]);
    const edge = schematic.hyperedges[0];
    const node = edge.nodes[0];
    node.rename("A1");
    expect(schematic.hyperedges[0].symbols).toEqual(["A1", "B", "C"]);
});

test("remove node indexes update", () => {
    const schematic = new GeneralSchematics([["A", "B", "C"]]);
    const edge = schematic.hyperedges[0];

    expect(edge.nodes[0].index).toBe(0);
    expect(edge.nodes[1].index).toBe(1);
    expect(edge.nodes[2].index).toBe(2);

    expect(edge.nodes[0].index).toBe(0);
    expect(edge.nodes[1].index).toBe(1);
});

test("insert node indexes update", () => {
    const schematic = new GeneralSchematics([["A", "B", "C"]]);
    const edge = schematic.hyperedges[0];

    expect(edge.nodes[0].index).toBe(0);
    expect(edge.nodes[1].index).toBe(1);
    expect(edge.nodes[2].index).toBe(2);

    edge.nodes[0].insert("A1");

    expect(edge.nodes[0].index).toBe(0);
    expect(edge.nodes[1].index).toBe(1);
    expect(edge.nodes[2].index).toBe(2);
    expect(edge.nodes[3].index).toBe(3);
});

test("remove node", () => {
    const schematic = new GeneralSchematics([["A", "B", "C"]]);
    const edge = schematic.hyperedges[0];

    edge.nodes[0].remove();
    expect(schematic.hyperedges[0].symbols).toEqual(["B", "C"]);

    edge.nodes[1].remove();
    expect(schematic.hyperedges[0].symbols).toEqual(["B"]);

    edge.nodes[0].remove(); // removes hyperedge too
    expect(schematic.hyperedges.length).toBe(0);
});

test("node uuid", () => {
    const schematic = new GeneralSchematics();
    schematic.add(["A", "B", "C"]);
    const uuid = schematic.hyperedges[0].nodes[0].uuid;
    const node = schematic.nodeByUUID(uuid);
    expect(node.id).toBe("0:A");
    expect(node.uuid).toMatch(uuid);
});

test("edge uuid", () => {
    const schematic = new GeneralSchematics();
    schematic.add(["A", "B", "C"]);

    const uuid = schematic.hyperedges[0].uuid;
    const edge = schematic.edgeByUUID(uuid);
    expect(edge.id).toBe("0:A.B.C");
    expect(edge.uuid).toMatch(uuid);
});

test("empty schematic", () => {
    const schematic = new GeneralSchematics();
    expect(schematic.hyperedges).toEqual([]);
});

test("build edge (isolated)", () => {
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["A", "B"]);
    expect(edge).instanceOf(Hyperedge);
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("0:A.B");
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge.add("C");
    expect(edge.symbols).toEqual(["A", "B", "C"]);
    expect(edge.id).toEqual("0:A.B.C");
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));

    const edge2 = schematic.get(["A", "B", "C"]);
    expect(edge2).instanceOf(Hyperedge);

    edge2.nodes[2].remove();
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("0:A.B");
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge2.removeAt(0)
    expect(edge.symbols).toEqual(["B"]);
    expect(edge.id).toEqual("0:B");
    expect(schematic.uniqueSymbols).toEqual(new Set(["B"]));
});

test("build edge (confluence)", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });
    const edge = schematic.add(["A", "B"]);
    expect(edge).instanceOf(Hyperedge);
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("A.B");
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge.add("C");
    expect(edge.symbols).toEqual(["A", "B", "C"]);
    expect(edge.id).toEqual("A.B.C");
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));

    const edge2 = schematic.get(["A", "B", "C"]);
    expect(edge2).instanceOf(Hyperedge);

    edge2.removeAt(2);
    expect(edge.symbols).toEqual(["A", "B"]);
    expect(edge.id).toEqual("A.B");
    expect(schematic.uniqueSymbols).toEqual(new Set(["A", "B"]));

    edge2.removeAt(0)
    expect(edge.symbols).toEqual(["B"]);
    expect(edge.id).toEqual("B");
    expect(schematic.uniqueSymbols).toEqual(new Set(["B"]));
});

test("edge dupes (fusion)", () => {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.FUSION });
    const edge1 = schematic.add(["A", "B"]);
    const edge2 = schematic.add(["A", "B"]);
    expect(edge1.id).toBe(edge2.id);
});

test("init with edges", () => {
    const hyperedges = [
        ["A", "B"],
    ];

    const schematic = new GeneralSchematics({ hyperedges });
    expect(schematic.hyperedges.length).toBe(1);
});

test("has node", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B"],
        ]
    });

    expect(schematic.has("A")).toBeTruthy();
    expect(schematic.has("B")).toBeTruthy();
    expect(schematic.has("C")).toBeFalsy();
});

test("has partial edge", () => {
    const schematic = new GeneralSchematics({
        hyperedges: [
            ["A", "B", "C"],
        ]
    });

    expect(schematic.has(["A", "B"])).toBeTruthy();
    expect(schematic.has(["B", "C"])).toBeTruthy();
    expect(schematic.has(["A", "B", "C"])).toBeTruthy();
    expect(schematic.has(["A", "C"])).toBeFalsy();
    expect(schematic.has(["A", "B", "C", "D"])).toBeFalsy();
});

test("regression hyperedge id() collision", async function () {
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["HELLO", "WORLD"]);

    expect(schematic.has(["H"])).toBeFalsy();
    expect(edge.has("HELLO")).toBeTruthy();
    expect(edge.has(["H"])).toBeFalsy();
    expect(edge.has(["O", "W"])).toBeFalsy(); // regression
});

test("equal", async function () {
    const schematic = new GeneralSchematics();
    const hyperedge1 = schematic.add(["A", "B", "C"]);
    const hyperedge2 = schematic.add(["A", "B", "C"]);
    const hyperedge3 = schematic.add(["A", "B", "C", "D"]);

    expect(hyperedge1.nodes[0].equal(hyperedge1.nodes[0])).toBeTruthy();
    expect(hyperedge1.nodes[0].equal(hyperedge1.nodes[1])).toBeFalsy();

    expect(hyperedge1.equal(hyperedge1)).toBeTruthy();
    expect(hyperedge1.equal(hyperedge2)).toBeFalsy();
    expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("compare hyperedge (confluence)", async function () {
    const schematic = new GeneralSchematics({ interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE });
    const hyperedge1 = schematic.add(["A", "B", "C"]);
    const hyperedge2 = schematic.add(["A", "B", "C"]);
    const hyperedge3 = schematic.add(["A", "B", "C", "D"]);

    expect(hyperedge1.equal(hyperedge2)).toBeTruthy();
    expect(hyperedge3.equal(hyperedge1)).toBeFalsy();
});

test("parses schematic", async function () {
    const schematic = new GeneralSchematics(`A->  B->  C
A -> B -> D `);
    expect(schematic).toBeInstanceOf(GeneralSchematics);
    expect(schematic.uniqueSymbols.size == 4).toBeTruthy();
    expect(schematic.hyperedges.length == 2).toBeTruthy();
    expect(schematic.has(["A", "B", "C"])).toBeTruthy();
    expect(schematic.has(["A", "B", "D"])).toBeTruthy();
});

test("parses comma in schematic", async function () {
    const schematic = new GeneralSchematics(`schematic -> tagline -> Turning C,S,V,s into Hypergraphs.`);
    expect(schematic).toBeInstanceOf(GeneralSchematics);
    expect(schematic.uniqueSymbols.size == 3).toBeTruthy();
    expect(schematic.hyperedges.length == 1).toBeTruthy();
    expect(schematic.has("schematic")).toBeTruthy();
    expect(schematic.has("tagline")).toBeTruthy();
    expect(schematic.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();
});

test("reset", async function () {
    const schematic = new GeneralSchematics(`schematic,tagline,"Turning C,S,V,s into Hypergraphs."`);
    expect(schematic).toBeInstanceOf(GeneralSchematics);
    schematic.reset();
    expect(schematic.uniqueSymbols.size).toBe(0);
    expect(schematic.hyperedges.length).toBe(0);
    expect(schematic.has("schematic")).toBeFalsy();
    expect(schematic.has("tagline")).toBeFalsy();
    expect(schematic.has("Turning C,S,V,s into Hypergraphs.")).toBeFalsy();
});

test("remove hyperedge", async function () {
    const schematic = new GeneralSchematics(`A->B->C\r\n1->2->3`);
    expect(schematic);
    expect(schematic.uniqueSymbols.size).toBe(6);
    expect(schematic.hyperedges.length).toBe(2);
    expect(schematic.has(["A", "B", "C"])).toBeTruthy();
    schematic.get(["A", "B", "C"]).remove();
    expect(schematic.has(["A", "B", "C"])).toBeFalsy();
    expect(schematic.uniqueSymbols.size).toBe(3);
    expect(schematic.hyperedges.length).toBe(1);
});

test("export", async function () {
    const input = `schematic -> tagline -> "Turning C,S,V,s into Hypergraphs."\nA -> B -> C -> D -> E -> F -> G`;
    const schematic = new GeneralSchematics(input);
    expect(schematic.uniqueSymbols.size).toBe(10);
    expect(schematic.hyperedges.length).toBe(2);

    const output = schematic.export();
    expect(input).toBe(output);

    schematic.parse(output);
    expect(schematic.uniqueSymbols.size).toBe(10);
    expect(schematic.hyperedges.length).toBe(2);
});

test("parse on existing hypergraph", async function () {
    const input = `schematic->tagline->Turning C,S,V,s into Hypergraphs.\nA->B->C->D->E->F->G`;
    const schematic = new GeneralSchematics();
    schematic.parse(input);

    expect(schematic.uniqueSymbols.size).toBe(10);
    expect(schematic.hyperedges.length).toBe(2);
    expect(schematic.has("schematic")).toBeTruthy();
    expect(schematic.has("tagline")).toBeTruthy();
    expect(schematic.has("Turning C,S,V,s into Hypergraphs.")).toBeTruthy();

    schematic.add(`A->B->C\n1->2->3`); // don't reset

    expect(schematic.uniqueSymbols.size).toBe(13);
    expect(schematic.hyperedges.length).toBe(4);
    expect(schematic.has("schematic")).toBeTruthy();
    expect(schematic.has("1")).toBeTruthy();
});

test("hyperedge has", () => {
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["A", "B", "C"]);
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

test("insert node at index", () => {
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["A", "B", "C"]);
    expect(edge.symbols).toEqual(["A", "B", "C"]);

    edge.insertAt("1", 0);
    expect(edge.symbols).toEqual(["1", "A", "B", "C"]);

    edge.insertAt("2", 2);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "C"]);

    edge.insertAt("3", 4);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C"]);

    edge.insertAt("4", 6);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C", "4"]);

    edge.insertAt("5", 10);
    expect(edge.symbols).toEqual(["1", "A", "2", "B", "3", "C", "4", "5"]);

    expect(edge.nodes[7].value).toBe("5");
    expect(edge.nodes[7].index).toBe(7);
});

test("add to node", () => {
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["A", "B", "C"]);
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
    const schematic = new GeneralSchematics();
    const edge = schematic.add(["A", "B", "C"]);
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
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.add(["A", "B", "C"]);
    const edge2 = schematic.add(["1", "2", "3"]);

    const A = edge1.firstNode;
    const One = edge2.firstNode;

    expect(schematic.hyperedges.length).toBe(2);
    A.connect(One);
    expect(schematic.hyperedges.length).toBe(3);
    expect(schematic.hyperedges[2].symbols).toEqual(["A", "1"]);
});

test("connect nodes middle", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.add(["A", "B", "C"]);
    const edge2 = schematic.add(["1", "2", "3"]);

    const B = edge1.secondNode
    const Two = edge2.secondNode

    expect(schematic.hyperedges.length).toBe(2);
    B.connect(Two);
    expect(schematic.hyperedges.length).toBe(3);
    expect(schematic.hyperedges[2].symbols).toEqual(["B", "2"]);
});

test("connect nodes end", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.add(["A", "B", "C"]);
    const edge2 = schematic.add(["1", "2", "3"]);

    const C = edge1.lastNode;
    const Three = edge2.lastNode;

    expect(schematic.hyperedges.length).toBe(2);
    C.connect(Three);
    expect(schematic.hyperedges.length).toBe(3);
    expect(schematic.hyperedges[2].symbols).toEqual(["C", "3"]);
});

test("connect nodes partial", () => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.FUSION
    });

    const edge1 = schematic.add(["A", "B", "C"]);
    const edge2 = schematic.add(["1", "2", "3"]);

    const B = edge1.secondNode;
    const One = edge2.firstNode;

    expect(schematic.hyperedges.length).toBe(2);
    B.connect(One);
    expect(schematic.hyperedges.length).toBe(3);
    expect(schematic.hyperedges[2].symbols).toEqual(["B", "1"]);
});