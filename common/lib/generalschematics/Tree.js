import Hypertexts from './Hypertexts.js';
import Hyperedge from "./Hyperedge";
import Hypertext from "./Hypertext";
import Node from "./Node";
import EmptyLine from "./EmptyLine";

import { sha256 } from './utils.js';

export default class Tree {
    static Hypertext = Hypertext;
    static Hyperedge = Hyperedge;
    static Node = Node;
    static EmptyLine = EmptyLine;

    static LineTypes = [EmptyLine, Hyperedge, Hypertext];

    constructor() {
        this.input = "";
        this.lines = [];
        this.lastLines = [];
        this.hypertexts = new Hypertexts(this);
    }

    get hash() { return sha256(this.str) }
    get length() { return this.lines.length }
    get output() { return this.lines.map(line => line.output).join("\n") }
    get hyperedges() { return this.lines.filter(line => line instanceof Hyperedge) }
    get nodes() { return this.hyperedges.flatMap(edge => edge.nodes) }
    get symbols() { return this.hyperedges.flatMap(edge => edge.symbols) }
    get uniqueSymbols() { return new Set(this.symbols) }
    get str() { return this.lines.map(line => line.str).join("\n") }
    debug() {
        console.log(`\ntree [${this.hash}]`);
        for (const line of this.lines) { console.log(`  ${line.str}`) }
        console.log("\n--------------------------\n");
        console.log(`"${this.output}"`)
        console.log("");
    }

    parseLine(line, index) {
        const match = this.matches(line, index)
        if (match) {
            this.lines.push(match);
            return match;
        }

        for (const LineType of Tree.LineTypes) {
            if (LineType.matches(line)) {
                const lineType = new LineType(line, this)
                this.lines.push(lineType);
                return lineType;
            }
        }

        throw new Error(`Could not parse line: ${line}`);
    }

    matches(line, index) {
        // absolute match
        for (const lastLine of this.lastLines) {
            if (lastLine.index !== index) continue;
            if (lastLine.line !== line) continue;
            if (this.lines.includes(lastLine)) continue;
            return lastLine;
        }

        // relative match
        for (const lastLine of this.lastLines) {
            if (lastLine.line !== line) continue;
            if (this.lines.includes(lastLine)) continue;
            return lastLine;
        }
    }

    removeAt(index) {
        this.lines.splice(index, 1);
    }

    reset() {
        this.lastLines = this.lines;
        this.lines = [];
    }

    add(input) {
        if (Array.isArray(input)) { input = input.join(" ->  ") }

        if (typeof input === "string") {
            return this.parseLine(input, this.lines.length);
        }

        throw new Error("Input must be a string or an array of strings");
    }

}