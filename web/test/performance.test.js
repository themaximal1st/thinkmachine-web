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

test("generate complex dom", async () => {
    const start = Date.now();

    const schematic = new GeneralSchematics();
    schematic.parse(data);

    for (let i = 0; i < 2000; i++) {
        expect(schematic.dom.length).toBeGreaterThan(0);
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1000);
});

test.only("sub-cache complex dom with iterative updates", async () => {
    const start = Date.now();

    // sub-cache is getting blown out by iterative update....why?
    const schematic = new GeneralSchematics();

    for (let i = 0; i < data.length; i++) {
        schematic.parse(data.slice(0, i));
        // const dom = schematic.dom;
    }

    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(1250);
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

This is some hypertext about number theory...it's cool.

Prime numbers are interesting because they are the building blocks of integers and have unique properties that form the basis of many mathematical theories.

For example, Fermat's Little Theorem and Euler's Totient Function are essential in understanding the behavior of primes within number theory.

The Riemann Hypothesis, one of the most famous unsolved problems in mathematics, is deeply connected to prime numbers and their distribution along the number line.

In mathematics, modular arithmetic and congruences play a crucial role in solving problems related to finite fields and cyclic groups.

These concepts are vital in areas such as cryptography and computer science. Furthermore, the study of integers, rational numbers, and irrational numbers reveals a rich structure of real numbers that has profound implications in various fields of mathematics and science.

Red is a cool color and so is blue and green.

Red, with its wavelength of 620-750 nm, brings energy and passion.

Blue, with a wavelength of 450-495 nm, provides a sense of calm and stability.

Green, falling between 495-570 nm, symbolizes growth and renewal.

These primary colors form the basis of various color schemes, including complementary, analogous, and triadic colors, which are essential in art and design.

Understanding the visible spectrum and the properties of light wavelengths helps us appreciate the beauty of a rainbow, where red, orange, yellow, green, blue, indigo, and violet come together in a harmonious display.

The phenomenon of refraction and dispersion in water droplets or a prism creates the vivid colors we see in a rainbow, demonstrating the principles of additive and subtractive color mixing.

In summary, the connections between number theory, mathematics, color theory, and the natural world reveal a fascinating interplay of patterns and properties.
Whether through the abstract beauty of prime numbers or the vibrant spectrum of a rainbow, these concepts enrich our understanding of the universe.

`

