import GeneralSchematics from "@lib/generalschematics"

import { expect, test } from "vitest";

test("hypergraph add", () => new Promise(done => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hyperedge.add" && data.symbols.includes("1")) {
                expect(schematic.hash).not.toBe(hash);
                done();
            }
        }
    });

    const hash = schematic.hash;
    schematic.add(["1", "2", "3"]);
}));

test("node add", () => new Promise(done => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.add" && data.symbol === "D") {
                expect(schematic.hash).not.toBe(hash);
                done();
            }
        }
    });
    const hash = schematic.hash;
    schematic.hyperedges[0].add("D");
}));

test("hyperedge remove", () => new Promise(done => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: (event) => {
            if (event.event === "hyperedge.remove") {
                expect(schematic.hash).not.toBe(hash);
                done();
            }
        }
    });

    const hash = schematic.hash;
    const edge = schematic.hyperedges[0];
    edge.remove();
}));

test("node rename", () => new Promise(done => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.rename" && data.symbol === "3") {
                expect(schematic.hash).not.toBe(hash);
                done();
            }
        }
    });

    const hash = schematic.hash;
    schematic.hyperedges[0].lastNode.rename("3");
}));

test("node remove", () => new Promise(done => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.remove" && data.data.value === "C") {
                expect(schematic.hash).not.toBe(hash);
                done();
            }
        }
    });

    const hash = schematic.hash;
    schematic.hyperedges[0].lastNode.remove();
}));

test("node remove", () => new Promise(done => {
    const schematic = new GeneralSchematics([
        ["A", "B", "C"],
    ], {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "node.remove" && data.data.value === "C") {
                expect(schematic.hash).not.toBe(hash);
                done();
            }
        }
    });

    const hash = schematic.hash;
    schematic.hyperedges[0].lastNode.remove();
}));

test("hypertext add global", () => new Promise(done => {
    const schematic = new GeneralSchematics({
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hypertext.add" && data.value === "Hello World") {
                done();
            }
        }
    });

    schematic.hypertexts.add("Hello World");
}));

test("hypertext add local", () => new Promise(done => {
    const schematic = new GeneralSchematics("A -> B -> C", {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hypertext.add" && data.value === "Hello World" && data.owners.includes("A")) {
                done();
            }
        }
    });

    schematic.hypertexts.add("A", "Hello World");
}));

test("remove global hypertext", () => new Promise(done => {
    const schematic = new GeneralSchematics("Hello World", {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hypertext.remove" && data.value === "Hello World") {
                done();
            }
        }
    });

    const hypertext = schematic.hypertexts.global[0];
    hypertext.remove();
}));

test("remove local hypertext", () => new Promise(done => {
    const schematic = new GeneralSchematics("A -> B -> C\nHello World for A", {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hypertext.remove" && data.value === "Hello World for A") {
                done();
            }
        }
    });

    const hypertext = schematic.hypertexts.get("A")[0];
    hypertext.remove();
}));

test("update global hypertext", () => new Promise(done => {
    const schematic = new GeneralSchematics("Hello World", {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hypertext.update" && data.value === "Hello World Updated") {
                done();
            }
        }
    });

    const hypertext = schematic.hypertexts.global[0];
    hypertext.value = "Hello World Updated";
}));

test("update local hypertext", () => new Promise(done => {
    const schematic = new GeneralSchematics("A -> B -> C\nThis belongs to A", {
        interwingle: GeneralSchematics.INTERWINGLE.CONFLUENCE,
        onUpdate: ({ event, data }) => {
            if (event === "hypertext.update" && data.value === "Updated A") {
                done();
            }
        }
    });

    const hypertext = schematic.hypertexts.get("A")[0];
    hypertext.value = "Updated A";
}));
