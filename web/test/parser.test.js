import Parser from "@lib/thinkabletype/parser";

import { expect, test } from "vitest";

test("parse string symbol", () => {
    expect(Parser.parseSymbol("A")).toEqual(["A", null])
});

test("parse string symbol with string meta", () => {
    expect(Parser.parseSymbol("A[hello]")).toEqual(["A", "hello"])
});

test("parse string symbol with env meta", () => {
    expect(Parser.parseSymbol(`A[hello=world and="there is more"]`)).toEqual(["A", { hello: "world", and: "there is more" }])
});

test("export string symbol", () => {
    expect(Parser.exportSymbol("A")).toEqual("A");
});

test("export string symbol with string meta", () => {
    expect(Parser.exportSymbol("A", "hello")).toEqual("A[hello]");
});

test("export string symbol with env meta", () => {
    expect(Parser.exportSymbol("A", { hello: "world", and: "there is more" })).toEqual(`A[hello="world" and="there is more"]`);
});

test("parse hyperedge", () => {
    expect(Parser.parseHyperedge("A,B,C")).toEqual(["A", "B", "C"]);
});

test("parse hyperedge meta string", () => {
    expect(Parser.parseHyperedge("A[hello],B,C")).toEqual(["A[hello]", "B", "C"]);
});

test("parse hyperedge meta env", () => {
    expect(Parser.parseHyperedge("A[hello=world],B,C")).toEqual(["A[hello=world]", "B", "C"]);
});

test("parse string meta with comma", () => {
    expect(Parser.parseSymbol("A[this, is a comma string]")).toEqual(["A", "this, is a comma string"])
});

test("parse hyperedge string meta with comma", () => {
    expect(Parser.parseHyperedge(`A[this, is a comma string],B,C`)).toEqual(["A[this, is a comma string]", "B", "C"]);
});

test("parse hyperedge string meta with comma and quotes", () => {
    expect(Parser.parseHyperedge(`A["this, is a quoted comma string"],B,C`)).toEqual([`A["this, is a quoted comma string"]`, "B", "C"]);
});

test("parse hyperedge meta env with comma and quotes", () => {
    expect(Parser.parseHyperedge(`A[note="this, is a quoted comma string"],B,C`)).toEqual([`A[note="this, is a quoted comma string"]`, "B", "C"]);
});
