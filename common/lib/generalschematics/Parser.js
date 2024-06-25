import { v4 as uuidv4 } from 'uuid';

class Line {
    constructor(line, index) {
        this.line = line;
        this.index = index;
        this.uuid = uuidv4();
    }

    get output() {
        return this.line;
    }

    static matches(line) {
        return true;
    }
}

class Hypertext extends Line {
    constructor() {
        super(...arguments);
    }

    get hypertext() {
        return this.line;
    }

    set hypertext(value) {
        this.line = value;
    }
}

class Hyperedge extends Line {
    static ARROW = /-+>|→/;

    constructor() {
        super(...arguments);
        this.nodes = [];
        this.add(Hyperedge.parse(this.line));
    }

    get symbols() { return this.nodes.map(node => node.symbol) }
    get firstNode() { return this.nodes[0] }
    get secondNode() { return this.nodes[1] }
    get lastNode() { return this.nodes[this.nodes.length - 1] }
    get middleNodes() {
        if (this.nodes.length < 3) { return [] }
        return this.nodes.slice(1, this.nodes.length - 1);
    }

    get output() {
        return this.nodes.map(node => node.symbol).join(" -> ");
    }

    add(symbol) {
        if (Array.isArray(symbol)) { return symbol.map(s => this.add(s)) }
        this.nodes.push(new Node(symbol, this));
        return this.lastNode;
    }

    static matches(line) {
        return Hyperedge.ARROW.test(line);
    }

    static parse(line) {
        return line.split("->").map(s => s.trim());
    }
}

class Node {
    constructor(symbol, hyperedge) {
        this.symbol = symbol;
        this.hyperedge = hyperedge;
        this.uuid = uuidv4();
    }

    get index() {
        return this.hyperedge.nodes.indexOf(this);
    }
}

class Tree {
    static LineTypes = [Hyperedge, Hypertext];

    constructor() {
        this.input = "";
        this.lines = [];
        this.lastLines = [];
    }

    get output() {
        return this.lines.map(line => line.output).join("\n");
    }

    get hypertexts() {
        return this.lines.filter(line => line instanceof Hypertext);
    }

    get hyperedges() {
        return this.lines.filter(line => line instanceof Hyperedge);
    }

    get nodes() {
        return this.hyperedges.flatMap(edge => edge.nodes);
    }

    get symbols() {
        return this.hyperedges.flatMap(edge => edge.symbols);
    }

    get uniqueSymbols() {
        return new Set(this.symbols);
    }

    parseLine(line, index) {
        const match = this.matches(line, index)
        if (match) {
            this.lines.push(match);
            return match;
        }

        for (const LineType of Tree.LineTypes) {
            if (LineType.matches(line)) {
                const lineType = new LineType(line, index)
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

    reset() {
        this.lastLines = this.lines;
        this.lines = [];
    }
}



export default class Parser {
    static Hypertext = Hypertext;
    static Hyperedge = Hyperedge;

    constructor(input = "") {
        this.tree = new Tree();
        this.parse(input);
    }

    get input() { return this.tree.input }
    get output() { return this.tree.output }
    get lines() { return this.tree.lines }
    get hypertexts() { return this.tree.hypertexts }
    get hyperedges() { return this.tree.hyperedges }
    get nodes() { return this.tree.nodes }
    get symbols() { return this.tree.symbols }
    get uniqueSymbols() { return this.tree.uniqueSymbols }

    parse(input) {
        this.tree.reset();
        this.tree.input = input;
        const lines = input.split("\n")
        for (const index in lines) {
            this.tree.parseLine(lines[index], index);
        }

        return this.tree;
    }

    update() {

    }

    updateLine() {

    }

    debug() {
        for (const line of this.lines.values()) {
            console.log(line);
        }
    }
}

