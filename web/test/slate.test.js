import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

test("simple slate export", () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    const slate = schematic.slate;
    expect(slate.length).toBe(1)
    expect(slate[0].type).toBe("paragraph")
    expect(slate[0].children.length).toBe(1)
    expect(slate[0].children[0].text).toBe("A -> B -> C")
});

test("empty slate export", () => {
    const schematic = new GeneralSchematics();
    const slate = schematic.slate;
    expect(slate.length).toBe(0)
});

test("simple hypertext slate export", () => {
    const schematic = new GeneralSchematics("This is some hypertext");
    const slate = schematic.slate;
    expect(slate.length).toBe(1)
    expect(slate[0].type).toBe("paragraph")
    expect(slate[0].children.length).toBe(1)
    expect(slate[0].children[0].text).toBe("This is some hypertext")
});

test("simple slate import export", () => {
    const schematic = new GeneralSchematics("A -> B -> C");
    expect(schematic.export()).toBe("A -> B -> C");
    schematic.parseSlate(schematic.slate);
    expect(schematic.export()).toBe("A -> B -> C");
});

test("simple hypertext slate import export", () => {
    const schematic = new GeneralSchematics("A -> B -> C\n\nThis is some hypertext\nand more");
    expect(schematic.export()).toBe("A -> B -> C\n\nThis is some hypertext\nand more");
    schematic.parseSlate(schematic.slate);
    expect(schematic.export()).toBe("A -> B -> C\nThis is some hypertext\nand more");
});


// import export import