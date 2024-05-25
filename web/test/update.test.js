import ThinkableType from "@lib/thinkabletype";

import { expect, test } from "vitest";


test("hypergraph add", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hyperedge.add" && data.symbols.includes("1")) {
                done();
            }
        }
    });

    thinkabletype.add(["1", "2", "3"]);
}));

test("node add", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.add" && data.symbol === "D") {
                done();
            }
        }
    });

    thinkabletype.hyperedges[0].add("D");
}));

test("hyperedge remove", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: (event) => {
            if (event.event === "hyperedge.remove") {
                done();
            }
        }
    });

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
                done();
            }
        }
    });

    thinkabletype.hyperedges[0].lastNode.rename("3");
}));

test("node remove", () => new Promise(done => {
    const thinkabletype = new ThinkableType([
        ["A", "B", "C"],
    ], {
        interwingle: ThinkableType.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.remove" && data.symbol === "C") {
                done();
            }
        }
    });

    thinkabletype.hyperedges[0].lastNode.remove();
}));