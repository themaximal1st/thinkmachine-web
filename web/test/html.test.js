import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

test("simple html export", () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.html).toEqual("<p>A -> B -> C</p>");
});

test("stable tree after html export", () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.tree.children[0].children[0].children.length).toEqual(3);
    expect(schematic.html).toEqual("<p>A -> B -> C</p>");
    expect(schematic.tree.children[0].children[0].children.length).toEqual(3);
});

test("parse html", () => {
    const schematic = new GeneralSchematics();
    schematic.parseHTML("<p>A -> B -> C</p>");
    expect(schematic.tree.children[0].children[0].children.length).toEqual(3);
    expect(schematic.input).toEqual("A -> B -> C");
    expect(schematic.html).toEqual("<p>A -> B -> C</p>");
    expect(schematic.tree.children[0].children[0].children.length).toEqual(3);
});