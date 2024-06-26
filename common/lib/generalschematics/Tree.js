import Hypertexts from './Hypertexts.js';
import Headers from "./Headers";

import Hyperedge from "./Hyperedge";
import Hypertext from "./Hypertext";
import Node from "./Node";
import EmptyLine from "./EmptyLine";
import Header from "./Header";

import { sha256 } from './utils.js';

export default class Tree {
    static Hypertext = Hypertext;
    static Hyperedge = Hyperedge;
    static Node = Node;
    static EmptyLine = EmptyLine;
    static Header = Header;

    static LineTypes = [EmptyLine, Header, Hyperedge, Hypertext];

    constructor() {
        this.input = "";
        this.lines = [];
        this.lastLines = [];
        this.hypertexts = new Hypertexts(this);
        this.headers = new Headers(this);
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
            this.lines.splice(index, 0, match);
            return match;
        }

        for (const LineType of Tree.LineTypes) {
            if (LineType.matches(line)) {
                const lineType = new LineType(line, this)
                this.lines.splice(index, 0, lineType);
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

    get lastLineIsHeaderSection() {

    }

    add() {
        let input;

        if (arguments.length === 2) {
            const symbol = arguments[0];
            if (typeof symbol !== "string") throw new Error("Symbol must be a string");
            return this.addHypertextForSymbol(symbol, arguments[1]);
        } else {
            input = arguments[0];
        }

        if (Array.isArray(input)) { input = input.join(" ->  ") }

        if (typeof input === "string") {
            // would placing this line put me in a header?
            const lastLine = this.lines[this.lines.length - 1];
            return this.parseLine(input, this.lines.length);
        }

        throw new Error("Input must be a string or an array of strings");
    }

    addHypertextForSymbol(symbol, hypertext) {
        const header = this.findAny({ header: symbol });
        if (header) {
            return header.add(hypertext);
        } else {
            this.parseLine(`# ${symbol}`, this.lines.length);
            return this.parseLine(arguments[1], this.lines.length);
        }
    }

    find(input = null) {
        return this.lines.map(line => line.filter(input)).filter(line => line).flat();
    }

    findOne(input = null) {
        const matches = this.find(input);
        if (matches.length === 0) return null;
        if (matches.length > 1) throw new Error("Multiple matches found");
        return matches[0];
    }

    findAny(input = null) {
        const matches = this.find(input);
        if (matches.length === 0) return null;
        return matches[0];
    }

    walk(callback) {
        const results = [];
        for (const line of this.lines) {
            if (!callback(line)) return results;
            results.push(line);
        }
        return results;
    }

    walkBack(callback) {
        const results = [];
        for (let i = this.lines.length - 1; i >= 0; i--) {
            const line = this.lines[i];
            if (!callback(line)) return results;
            results.push(line);
        }
        return results;
    }
}