import ThinkableType from "@lib/thinkabletype";
const Hyperedge = ThinkableType.Hyperedge;

import { expect, test } from "vitest";
test("test with meta object", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    const createdAt = new Date();
    A.meta = {
        createdAt,
        userVar: true,
    };

    expect(A.meta.createdAt).toBe(createdAt);
    expect(A.meta.userVar).toBe(true);
});

test("test with meta property", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    const createdAt = new Date();
    A.meta.createdAt = createdAt;
    A.meta.userVar = true;

    expect(A.meta.createdAt).toBe(createdAt);
    expect(A.meta.userVar).toBe(true);
});


test("test with note", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.meta.notes = "This is a note";
    expect(A.meta.notes).toBe("This is a note");
});

test("test export and import string", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.meta = "Meta is a string";

    const exported = thinkabletype.export();
    expect(exported).toBe("A[Meta is a string],B,C");

    thinkabletype.reset();
    thinkabletype.parse(exported);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
    expect(thinkabletype.hyperedges[0].nodes[0].meta).toBe("Meta is a string");
});

test("test export and import single key value", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.meta.notes = "Meta is a string";

    const exported = thinkabletype.export();
    expect(exported).toBe('A[notes="Meta is a string"],B,C');

    thinkabletype.reset();
    thinkabletype.parse(exported);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
    expect(thinkabletype.hyperedges[0].nodes[0].meta.notes).toBe("Meta is a string");
});

test("test export and import object", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    const date = new Date();
    A.meta.notes = "This is a note";
    A.meta.createdAt = date;
    A.meta.userVar = true;

    const exported = thinkabletype.export();
    expect(exported).toBe(`A[notes="This is a note" createdAt="${date.toISOString()}" userVar=true],B,C`);

    thinkabletype.reset();
    thinkabletype.parse(exported);
    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
    expect(thinkabletype.hyperedges[0].nodes[0].meta.notes).toBe("This is a note");
    expect(thinkabletype.hyperedges[0].nodes[0].meta.createdAt).toBe(date.toISOString());
    expect(thinkabletype.hyperedges[0].nodes[0].meta.userVar).toBe(true);
});

test("test json types", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.meta.hello = "This is a";
    B.meta.hello = "This is b";
    C.meta.date = 1234567890;

    const exported = thinkabletype.export();
    expect(exported).toBe(`A[hello="This is a"],B[hello="This is b"],C[date=1234567890]`);

    const thinkabletype2 = ThinkableType.parse(exported);
    expect(thinkabletype2.hyperedges.length).toBe(1);
    expect(thinkabletype2.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
    const edge2 = thinkabletype2.hyperedges[0];
    const [A2, B2, C2] = edge2.nodes;
    expect(A2.meta.hello).toBe("This is a");
    expect(B2.meta.hello).toBe("This is b");
    expect(C2.meta.date).toBe(1234567890);
});

test("test duplicate overwrite", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
        ["A", "1", "2"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.FUSION,
    });

    const edge1 = thinkabletype.hyperedges[0];
    const edge2 = thinkabletype.hyperedges[1];
    edge1.nodes[0].meta = "This is a";
    edge2.nodes[0].meta = "This is also a";

    const exported = thinkabletype.export();
    expect(exported).toBe(`A[This is a],B,C\nA[This is also a],1,2`);

    const thinkabletype2 = ThinkableType.parse(exported);
    expect(thinkabletype2.hyperedges.length).toBe(2);
    expect(thinkabletype2.uniqueSymbols).toEqual(new Set(["A", "B", "C", "1", "2"]));
    expect(thinkabletype2.hyperedges[0].nodes[0].meta).toBe("This is a");
    expect(thinkabletype2.hyperedges[1].nodes[0].meta).toBe("This is also a");
});

test("test note with a comma", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    edge.nodes[0].meta = "This is a, comma, note.";

    const exported = thinkabletype.export();
    expect(exported).toBe(`A[This is a, comma, note.],B,C`);

    thinkabletype.reset();
    thinkabletype.parse(exported);

    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
    expect(thinkabletype.hyperedges[0].nodes[0].meta).toBe("This is a, comma, note.");
});