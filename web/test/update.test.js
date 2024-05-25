import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";

test("hypergraph add", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hyperedge.add" && data.symbols.includes("1")) {
                expect(thinkabletype.hash).toBe("d6e7912076f9c5c6eafff5c4a1d42ded8205a9019c296b9dbb0e9139041ed086");
                done();
            }
        }
    });

    expect(thinkabletype.hash).toBe("28f0fd5933ae52842b0f0a6e80b6876e5252f8e7549d768c2f76165e56b6f118");

    thinkabletype.add(["1", "2", "3"]);
}));

test("node add", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.add" && data.symbol === "D") {
                expect(thinkabletype.hash).toBe("17f5f129f4c769967a884bc2c630677b4479d0a5858de30130b9727c6b335432");
                done();
            }
        }
    });
    expect(thinkabletype.hash).toBe("28f0fd5933ae52842b0f0a6e80b6876e5252f8e7549d768c2f76165e56b6f118");
    thinkabletype.hyperedges[0].add("D");
}));

test("hyperedge remove", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: (event) => {
            if (event.event === "hyperedge.remove") {
                expect(thinkabletype.hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
                done();
            }
        }
    });

    expect(thinkabletype.hash).toBe("28f0fd5933ae52842b0f0a6e80b6876e5252f8e7549d768c2f76165e56b6f118");
    const edge = thinkabletype.hyperedges[0];
    edge.remove();
}));

test("node rename", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.rename" && data.symbol === "3") {
                expect(thinkabletype.hash).toBe("58553ac0aebd16d35a29fbe988544ba71ca2d6c7cfe674b4303dfff83183b0c4");
                done();
            }
        }
    });

    expect(thinkabletype.hash).toBe("28f0fd5933ae52842b0f0a6e80b6876e5252f8e7549d768c2f76165e56b6f118");
    thinkabletype.hyperedges[0].lastNode.rename("3");
}));

test("node remove", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.remove" && data.symbol === "C") {
                expect(thinkabletype.hash).toBe("b17c8419f544abd0648345006bbe975b43acf9fc878712a1116312f3e1e24b2e");
                done();
            }
        }
    });

    expect(thinkabletype.hash).toBe("28f0fd5933ae52842b0f0a6e80b6876e5252f8e7549d768c2f76165e56b6f118");
    thinkabletype.hyperedges[0].lastNode.remove();
}));
