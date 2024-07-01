import GeneralSchematics from "@lib/generalschematics"
import { expect, test } from "vitest";

// test high-level API — specifics are handled in other tests

test("parse simple doc", async () => {
    const data = "A -> B -> C";

    const start = Date.now();

    const schematic = new GeneralSchematics();

    for (let i = 0; i < 10000; i++) {
        schematic.parse(data);
        expect(schematic.hyperedges.length).toEqual(1);
        expect(schematic.nodes.length).toEqual(3);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

test("parse complex doc", async () => {
    const start = Date.now();
    expect(data.length).toBeGreaterThan(1000);

    const schematic = new GeneralSchematics();

    for (let i = 0; i < 2000; i++) {
        schematic.parse(data);
        expect(schematic.hyperedges.length).toEqual(66);
        expect(schematic.nodes.length).toEqual(179);
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
});

test("generate simple dom", async () => {
    const data = "A -> B -> C\nThis is some A hypertext";

    const start = Date.now();

    const schematic = new GeneralSchematics();

    for (let i = 0; i < 10000; i++) {
        schematic.parse(data);
        expect(schematic.dom.length).toBeGreaterThan(0);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

test("fast edge hash", async () => {
    const start = Date.now();
    const schematic = new GeneralSchematics(data);

    for (let i = 0; i < 10000; i++) {
        expect(schematic.edgehash).toBeGreaterThan(0);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

test("fast text hash", async () => {
    const start = Date.now();
    const schematic = new GeneralSchematics("This is some text\nWe are hashing it\nA -> B -> C\nA is connected to B and C");

    for (let i = 0; i < 10000; i++) {
        expect(schematic.texthash).toBeGreaterThan(0);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

test("fast hash", async () => {
    const start = Date.now();
    const schematic = new GeneralSchematics(data);

    for (let i = 0; i < 10000; i++) {
        expect(schematic.hash).toBeGreaterThan(0);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

// TODO: fast hash


test("generate complex dom", async () => {
    const start = Date.now();

    const schematic = new GeneralSchematics();

    for (let i = 0; i < 2000; i++) {
        schematic.parse(data);
        expect(schematic.dom.length).toBeGreaterThan(0);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});


const data = `color -> light -> wavelength
color -> perception -> vision
color -> primary colors -> red,blue,yellow
color -> secondary colors -> orange,green,purple
color -> tertiary colors
color -> complementary colors
color -> analogous colors
color -> triadic colors
color -> color harmony
color -> color psychology
color -> emotion -> mood
color -> symbolism -> meaning
color -> culture -> context
color -> art -> design
color -> painting -> pigment
color -> additive color -> light
color -> subtractive color -> pigment
color -> color wheel -> color scheme
color -> color temperature -> warm colors -> cool colors
rainbow -> colors
rainbow -> red -> orange -> yellow -> green -> blue -> indigo -> violet
rainbow -> visible spectrum -> light
rainbow -> refraction -> water droplets
rainbow -> optical phenomenon
rainbow -> prism -> dispersion
rainbow -> primary colors -> red -> blue -> yellow
rainbow -> secondary colors -> orange -> green -> violet
rainbow -> tertiary colors
rainbow -> color wheel
rainbow -> additive color mixing
rainbow -> subtractive color mixing
rainbow -> light wavelengths
rainbow -> nanometers -> visible light spectrum
rainbow -> Roy G. Biv -> mnemonic device
rainbow -> atmospheric optics
rainbow -> reflection -> refraction -> dispersion
rainbow -> double rainbow -> secondary rainbow
rainbow -> supernumerary rainbows
red -> green -> blue
red -> primary color
green -> primary color
blue -> primary color
red -> color
green -> color
blue -> color
red -> visible spectrum
green -> visible spectrum
blue -> visible spectrum
red -> wavelength -> 620-750 nm
green -> wavelength -> 495-570 nm
blue -> wavelength -> 450-495 nm
red -> light
green -> light
blue -> light
red -> pigment
green -> pigment
blue -> pigment
mathematics -> arithmetic -> algebra
number theory -> prime numbers -> integers
number theory -> mathematical logic -> abstract algebra
number theory -> combinatorics -> graph theory
number theory -> algebraic geometry -> analytic number theory
integers -> rational numbers -> irrational numbers
primes -> Fermat's Little Theorem -> Euler's Totient Function
Riemann Hypothesis -> analytic number theory -> zeta function
modular arithmetic -> congruences -> finite fields

This is some hypertext about number theory...it's cool

Prime numbers are interesting...
`

