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

test("test export", () => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ]);

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    A.meta.userVar = true;

    const exported = thinkabletype.export();
    expect(exported).toBe("A,B,C\r\nA,_meta,userVar,true");
});

test("test export", () => {
    const thinkabletype = ThinkableType.parse(`A,B,C\r\nA,_meta,userVar,true`);

    expect(thinkabletype.hyperedges.length).toBe(1);
    expect(thinkabletype.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));

    const edge = thinkabletype.hyperedges[0];
    const [A, B, C] = edge.nodes;

    expect(A.meta.userVar).toBe(true);
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
    expect(exported).toBe(`A,B,C\r\nA,_meta,hello,This is a\r\nB,_meta,hello,This is b\r\nC,_meta,date,1234567890`);

    const thinkabletype2 = ThinkableType.parse(exported);
    expect(thinkabletype2.hyperedges.length).toBe(1);
    expect(thinkabletype2.uniqueSymbols).toEqual(new Set(["A", "B", "C"]));
    const edge2 = thinkabletype2.hyperedges[0];
    const [A2, B2, C2] = edge2.nodes;
    expect(A2.meta.hello).toBe("This is a");
    expect(B2.meta.hello).toBe("This is b");
    expect(C2.meta.date).toBe(1234567890);
});