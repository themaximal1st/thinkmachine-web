import Hypertexts from './Hypertexts.js';
import Headers from "./Headers";

import Hyperedge from "./Hyperedge";
import Hypertext from "./Hypertext";
import Node from "./Node";
import EmptyLine from "./EmptyLine";
import Header from "./Header";
import Colors from './colors.js';

import { sha256, arrayContains } from './utils.js';

export default class Tree {
    static Hypertext = Hypertext;
    static Hyperedge = Hyperedge;
    static Node = Node;
    static EmptyLine = EmptyLine;
    static Header = Header;

    static LineTypes = [EmptyLine, Header, Hyperedge, Hypertext];

    // TODO: maybe we move these up to schematic? since we have Graph now...
    static INTERWINGLE = {
        ISOLATED: 0,        // only explicit connections you've added
        CONFLUENCE: 1,      // shared parents
        FUSION: 2,          // shared children
        BRIDGE: 3           // shared symbols
    };

    static DEPTH = {
        SHALLOW: 0,         // don't connect
        // any number between 1 and Infinity is valid, up to maxDepth
        DEEP: Infinity,     // infinitely connect
    };


    constructor(options = {}) {
        this.input = "";
        this.options = options || {};
        if (typeof this.options.interwingle === "undefined") this.options.interwingle = Tree.INTERWINGLE.ISOLATED;
        if (typeof this.options.depth === "undefined") this.options.depth = Tree.DEPTH.SHALLOW;
        if (typeof this.options.colors === "undefined") this.options.colors = Colors;

        this.listeners = this.options.listener ? [this.options.listener] : [];

        this.lines = [];
        this.lastLines = [];
        this.uuids = {};

        this.hypertexts = new Hypertexts(this);
        this.headers = new Headers(this);
    }

    get interwingle() { return this.options.interwingle }
    set interwingle(value) { this.options.interwingle = value }
    get depth() { return this.options.depth }
    set depth(value) { this.options.depth = value }
    get colors() { return this.options.colors }
    set colors(value) { this.options.colors = value }
    get isIsolated() { return this.interwingle === Tree.INTERWINGLE.ISOLATED }
    get isConfluence() { return this.interwingle >= Tree.INTERWINGLE.CONFLUENCE }
    get isFusion() { return this.interwingle >= Tree.INTERWINGLE.FUSION }
    get isBridge() { return this.interwingle >= Tree.INTERWINGLE.BRIDGE }

    get hash() { return sha256(this.str) }
    get edgehash() { return sha256(JSON.stringify(this.symbols)) }
    get texthash() { return sha256(this.text) }
    get text() { return this.lines.filter(line => !(line instanceof Hyperedge)).map(line => line.output).join("\n") }
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


    get(symbols) {
        for (const hyperedge of this.hyperedges) {
            if (arrayContains(hyperedge.symbols, symbols)) { return hyperedge }
        }

        return null;
    }

    has(symbol) {
        if (Array.isArray(symbol)) {
            return !!this.get(symbol);
        } else {
            return this.uniqueSymbols.has(symbol);
        }
    }

    nodeByUUID(uuid) { for (const node of this.nodes) { if (node.uuid === uuid) return node } }
    nodeByID(id) { for (const node of this.nodes) { if (node.id === id) return node } }
    nodeByUID(uid) { for (const node of this.nodes) { if (node.uid === uid) return node } }
    edgeByUUID(uuid) { for (const hyperedge of this.hyperedges) { if (hyperedge.uuid === uuid) return hyperedge } }

    onUpdate(e) { for (const listener of this.listeners) { listener(e) } }
    addEventListener(listener) { this.listeners.push(listener) }
    removeEventListener(listener) { this.listeners = this.listeners.filter(l => l !== listener) }

    parseLine(line, index = null) {
        if (index === null) index = this.lines.length;

        const match = this.matches(line, index)
        if (match) {
            this.lines.splice(index, 0, match);
            return match;
        }

        for (const LineType of Tree.LineTypes) {
            if (LineType.matches(line)) {
                const lineType = new LineType(line, this)

                this.lines.splice(index, 0, lineType);

                if (lineType.isHyperedge) {
                    for (const node of lineType.nodes) {
                        node.uuid = this.trackUUID(node);
                    }
                }

                this.onUpdate({ event: "parse.line", name: lineType.name, data: lineType });

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
        this.uuids = { uid: new Map(), symbol: new Map(), used: new Map() };

        for (const node of this.nodes) {
            this.uuids.uid.set(node.uid, node.uuid);
            this.uuids.symbol.set(node.symbol, node.uuid);
        }

        this.lastLines = this.lines;
        this.lines = [];
    }

    trackUUID(node) {
        let uuid = this.uuids.uid.get(node.uid);
        if (uuid && !this.uuids.used.has(uuid)) {
            this.uuids.used.set(uuid, node);
            this.uuids.uid.delete(node.uid);
            return uuid;
        }

        uuid = this.uuids.symbol.get(node.symbol);
        if (uuid && !this.uuids.used.has(uuid)) {
            this.uuids.used.set(uuid, node);
            this.uuids.symbol.delete(node.symbol);
            return uuid;
        }


        return node.uuid;
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

        if (Array.isArray(input)) { input = input.join("-> ") }

        if (typeof input === "string") {
            const lastLine = this.lines[this.lines.length - 1];
            if (lastLine && lastLine.isHeaderOwned) {
                this.parseLine("\n");
                this.parseLine("\n");
            }

            return this.parseLine(input);
        }

        throw new Error("Input must be a string or an array of strings");
    }

    addHypertextForSymbol(symbol, hypertext) {
        const header = this.findAny({ header: symbol });
        if (header) {
            return header.add(hypertext);
        } else {
            this.parseLine(`# ${symbol}`);
            return this.parseLine(arguments[1]);
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