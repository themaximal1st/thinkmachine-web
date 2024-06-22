import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

test("missing hypertext symbol", () => {
    const schematic = new GeneralSchematics("A -> B -> C\nThis is some hypertext");
    expect(schematic.export()).toEqual("A -> B -> C\nThis is some hypertext");

    const [A, _] = schematic.get(["A"]).nodes;
    expect(A.hypertexts.length).toEqual(0);
    A.hypertext.add("This is about one");
    expect(A.hypertexts.length).toEqual(1);
});


test("numeric symbol", () => {
    const schematic = new GeneralSchematics(`1 -> 2 -> 3\nThis is for 1`);
    expect(schematic.hyperedges[0].nodes[0].value).toEqual("1");
    expect(schematic.hyperedges[0].nodes[1].value).toEqual("2");
    expect(schematic.hyperedges[0].nodes[2].value).toEqual("3");
    expect(schematic.export()).toEqual("1 -> 2 -> 3\nThis is for 1");

    const [one, _] = schematic.get(["1"]).nodes;
    expect(one).toBeDefined();
    expect(one.hypertexts.length).toEqual(1);
    schematic.hyperedges[0].nodes[0].hypertext.add("This is about one");
    expect(one.hypertexts.length).toEqual(2);
});

test("punctuation", () => {
    const schematic = new GeneralSchematics();

    schematic.parse(`A -> B -> C\nThis is for C`);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C.`);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C?`);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C!`);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C—and then more.`); // long dash = symbol
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C-and then more.`); // short dash = symbol
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C(and then more)`);
    expect(schematic.hypertexts.get("C").length).toEqual(1);

    schematic.parse(`A -> B -> C\nThis is for C/B`);
    expect(schematic.hypertexts.get("C").length).toEqual(1);
});

test("symbolify section", () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\n## A\nThis is some hypertext.\nIt goes on and on\n\n## C\nThis is some more hypertext.\nIt goes on and on");
    expect(schematic.hypertexts.get("A").length).toEqual(2);
    expect(schematic.hypertexts.get("C").length).toEqual(2);
});

test("symbol token matching", async () => {
    const schematic = new GeneralSchematics("This is A -> This is B -> This is C\n\nThis is AA not matching anything");
    expect(schematic.hypertexts.global.length).toEqual(1);
    expect(schematic.hypertexts.get("This is A").length).toEqual(0);
});

test("hypertext and symbols with spaces", async () => {
    const schematic = new GeneralSchematics("This is A -> This is B -> This is C\n\nThis is A is a cool symbol with spaces.");
    expect(schematic.hypertexts.global.length).toEqual(0);
    expect(schematic.hypertexts.get("This is A").length).toEqual(1);
});

test.skip("symbolify section until double break", () => {
    const schematic = new GeneralSchematics(`
Hello World
And more

And more1


And even more2`);

    // schematic.debug();

    // expect(schematic.hypertexts.get("A").length).toEqual(2);
});