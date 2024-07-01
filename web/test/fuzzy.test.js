import FuzzyText from "@lib/generalschematics/FuzzyText.js"

import { expect, test } from "vitest";

test("simple fuzzy match", async () => {
    expect(FuzzyText.matches("Hypergraph", "hyper-graph")).toBeTruthy();
    expect(FuzzyText.matches("Hypergraph", "hyper graph")).toBeTruthy();
    expect(FuzzyText.matches("Hypergraph", "hyper graph ")).toBeTruthy();
    expect(FuzzyText.matches("HYPERGRAPH", "hypergraph")).toBeTruthy();
    expect(FuzzyText.matches("hypergraph", "HyperGraph's")).toBeTruthy();

    expect(FuzzyText.matches("HyperSpace", "HyperGraph")).toBeFalsy();
    expect(FuzzyText.matches("HyperGraph", "HyperGrap")).toBeFalsy();
    expect(FuzzyText.matches("HyperGraph", "hyperedge")).toBeFalsy();
    expect(FuzzyText.matches("HyperGraph", "hyperedge")).toBeFalsy();
});