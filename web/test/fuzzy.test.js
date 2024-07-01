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
    expect(FuzzyText.matches("HyperGraph", "h")).toBeFalsy();
    expect(FuzzyText.matches("A", "awe")).toBeFalsy();
});

test("containsSymbol method", () => {
    const paragraph1 = "The quick brown fox jumps over the lazy dog. HyperGraphs are interesting.";
    expect(FuzzyText.containsSymbol(paragraph1, "Hypergraph")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph1, "lazy dog")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph1, "quick brown")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph1, "cat")).toBeFalsy();
    expect(FuzzyText.containsSymbol(paragraph1, "interesting concept")).toBeFalsy();

    expect(FuzzyText.containsSymbol(paragraph1, "HyperGap")).toBeFalsy();

    expect(FuzzyText.containsSymbol(paragraph1, "fox")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph1, "cat")).toBeFalsy();

    expect(FuzzyText.containsSymbol(paragraph1, "HYPERGRAPHS")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph1, "LAZY DOG")).toBeTruthy();

    const paragraph2 = "The system uses hyper-graphs and hyper-edges for complex data representation.";
    expect(FuzzyText.containsSymbol(paragraph2, "hyper graphs")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph2, "hyper-edges")).toBeTruthy();

    const paragraph3 = "HyperGraphs are powerful. They can model complex relationships.";
    expect(FuzzyText.containsSymbol(paragraph3, "HyperGraph")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph3, "relationships")).toBeTruthy();

    const longParagraph = "A".repeat(1000) + "HyperGraph" + "B".repeat(1000);
    expect(FuzzyText.containsSymbol(longParagraph, "HyperGraph")).toBeTruthy();
    expect(FuzzyText.containsSymbol(longParagraph, "HyperEdge")).toBeFalsy();

    expect(FuzzyText.containsSymbol(paragraph1, "Hypergraph")).toBeTruthy();
    expect(FuzzyText.containsSymbol(paragraph1, "cat")).toBeFalsy();
});


test('findAllMatches with exact match', () => {
    const paragraph = "The quick brown fox jumps over the lazy dog";
    const matches = FuzzyText.findAllMatches(paragraph, "quick brown");
    expect(matches).toEqual([{ start: 4, end: 15 }]);
});

test('findAllMatches with fuzzy match', () => {
    const paragraph = "The quick brown fox jumps over the lazy dog";
    const matches = FuzzyText.findAllMatches(paragraph, "qUiCk BRoWN");
    expect(matches).toEqual([{ start: 4, end: 15 }]);
});

test('findAllMatches with multiple matches', () => {
    const paragraph = "HyperGraph and hypergraph are different spellings of Hyper-Graphs";
    const matches = FuzzyText.findAllMatches(paragraph, "HyperGraph");
    expect(matches).toEqual([
        { start: 0, end: 10 },
        { start: 15, end: 25 },
        { start: 53, end: 65 }
    ]);
});

test('findAllMatches with no matches', () => {
    const paragraph = "The quick brown fox jumps over the lazy dog";
    const matches = FuzzyText.findAllMatches(paragraph, "HyperGraph");
    expect(matches).toEqual([]);
});

test('findAllMatches with short symbol', () => {
    const paragraph = "The fox and the dog";
    const matches = FuzzyText.findAllMatches(paragraph, "the");
    expect(matches).toEqual([
        { start: 0, end: 3 },
        { start: 12, end: 15 }
    ]);
});

test('findAllMatches with single character', () => {
    const paragraph = "The fox and the dog";
    const matches = FuzzyText.findAllMatches(paragraph, "t");
    expect(matches).toEqual([]);
});