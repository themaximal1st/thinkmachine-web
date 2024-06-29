import { getInputOptions, trackUUID } from './utils.js';
import Parser from './Parser.js';
import Graph from './Graph.js';
// How much of Tree / GeneralSchematics should be the same thing?

export default class GeneralSchematics {
    static Parser = Parser
    static Tree = Parser.Tree;
    static Hypertext = Parser.Tree.Hypertext;
    static Hyperedge = Parser.Tree.Hyperedge;
    static Node = Parser.Tree.Node
    static EmptyLine = Parser.Tree.EmptyLine;
    static Header = Parser.Tree.Header;
    static INTERWINGLE = Parser.Tree.INTERWINGLE;
    static DEPTH = Parser.Tree.DEPTH;

    static trackUUID = trackUUID;

    constructor() {
        const { input, options } = getInputOptions(...arguments);
        this.parser = new Parser(input, options);
        this.graph = new Graph(this);
    }

    get interwingle() { return this.tree.interwingle }
    set interwingle(value) { this.tree.interwingle = value }
    get depth() { return this.tree.depth }
    set depth(value) { this.tree.depth = value }
    get isIsolated() { return this.tree.isIsolated }
    get isConfluence() { return this.tree.isConfluence }
    get isFusion() { return this.tree.isFusion }
    get isBridge() { return this.tree.isBridge }

    get tree() { return this.parser.tree }
    get hash() { return this.tree.hash }
    get input() { return this.tree.input }
    get output() { return this.tree.output }
    get dom() { return this.tree.dom }
    get html() { return this.tree.html }
    get lines() { return this.tree.lines }
    get hypertexts() { return this.tree.hypertexts }
    get hyperedges() { return this.tree.hyperedges }
    get headers() { return this.tree.headers }
    get nodes() { return this.tree.nodes }
    get symbols() { return this.tree.symbols }
    get uniqueSymbols() { return this.tree.uniqueSymbols }
    get str() { return this.tree.str }

    get() { return this.tree.get(...arguments) }
    has() { return this.tree.has(...arguments) }
    debug() { this.tree.debug() }

    reset() { this.tree.reset() }
    parse(input) { this.parser.parse(input) }
    add() { return this.tree.add(...arguments) }

    // TODO: candidates for indexes
    nodeByUUID() { return this.tree.nodeByUUID(...arguments) }
    nodeByID() { return this.tree.nodeByID(...arguments) }
    nodeByUID() { return this.tree.nodeByUID(...arguments) }
    edgeByUUID() { return this.tree.edgeByUUID(...arguments) }

    addEventListener() { return this.tree.addEventListener(...arguments) }
    removeEventListener() { return this.tree.removeEventListener(...arguments) }

    graphData() { return this.graph.graphData(...arguments) }

    filter(symbols) {
        if (symbols.length === 0) return [];
        if (!Array.isArray(symbols[0])) {
            symbols = [symbols];
        }

        return this.hyperedges.filter(hyperedge => {
            for (const symbol of symbols) {
                if (hyperedge.has(symbol)) { return true }
            }

            return false;
        });
    }

}
/*
import Hypergraph from './Hypergraph.js';
import Hypertexts from './Hypertexts.js';
import Parser from './Parser.js';
import { inspect } from "unist-util-inspect"
import { visit } from 'unist-util-visit'
import { sha256 } from './utils.js';
import Colors from './colors.js';

export default class GeneralSchematics {
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

    constructor(input = "", options = {}) {
        if (typeof input === "object" && !Array.isArray(input) && Object.keys(options).length === 0) {
            options = input;
            input = "";

            if (options.hyperedges && Array.isArray(options.hyperedges)) {
                input = options.hyperedges;
                delete options.hyperedges;
            }
        }

        if (Array.isArray(input)) {
            input = input.map(hyperedge => hyperedge.join(" -> ")).join("\n");
        }

        if (typeof input !== "string") throw new Error("Input must be a string");

        this.input = input;

        options.interwingle = options.interwingle || GeneralSchematics.INTERWINGLE.ISOLATED;
        options.depth = options.depth || GeneralSchematics.DEPTH.SHALLOW;
        options.colors = options.colors || Colors;

        const onUpdate = options.onUpdate;
        delete options.onUpdate;

        this.options = options;
        this.listeners = [];

        if (onUpdate) this.addEventListener(onUpdate);

        this.hypertexts = null;
        this.hypergraph = null;
        this.parser = new Parser();

        this.tree = null;
        this.hypertexts = new Hypertexts(this);
        this.hypergraph = new Hypergraph(this);

        this.parse();
    }


    get interwingle() { return this.options.interwingle }
    set interwingle(value) { this.options.interwingle = value }
    get depth() { return this.options.depth }
    set depth(value) { this.options.depth = value }
    get colors() { return this.options.colors }
    set colors(value) { this.options.colors = value }
    get isIsolated() { return this.interwingle === GeneralSchematics.INTERWINGLE.ISOLATED }
    get isConfluence() { return this.interwingle >= GeneralSchematics.INTERWINGLE.CONFLUENCE }
    get isFusion() { return this.interwingle >= GeneralSchematics.INTERWINGLE.FUSION }
    get isBridge() { return this.interwingle >= GeneralSchematics.INTERWINGLE.BRIDGE }

    get hash() { return sha256(inspect(this.tree)) }
    get hyperedges() { return this.hypergraph.hyperedges }
    get nodes() { return this.hypergraph.nodes }
    get symbols() { return this.hypergraph.symbols }
    get uniqueSymbols() { return this.hypergraph.uniqueSymbols }
    get() { return this.hypergraph.get(...arguments) }
    has() { return this.hypergraph.has(...arguments) }

    get html() { return this.parser.html() }
    get slate() { return this.parser.slate() }

    nodeByID(id) { return this.hypergraph.nodeByID(id) }
    nodeByUID(uid) { return this.hypergraph.nodeByUID(uid) }
    nodeByUUID(uuid) { return this.hypergraph.nodeByUUID(uuid) }
    edgeByUUID(uuid) { return this.hypergraph.edgeByUUID(uuid) }

    parse(input = null) {
        if (input !== null) this.input = input;

        this.parser.hypergraph = this.hypergraph;
        this.parser.input = this.input;
        this.parser.parse();

        this.tree = this.parser.tree;
        this.update();
        this.hypertexts = new Hypertexts(this);
        this.hypergraph = new Hypergraph(this);

        this.onUpdate({ event: "schematic.parse" });
    }

    parseHTML(html) {
        this.parse(this.parser.parseHTML(html));
    }

    parseSlate(slate) {
        this.parse(this.parser.parseSlate(slate));
    }

    update() {
        this.parser.update(this.tree);
    }

    removeEmptySections(symbols = []) {
        if (!Array.isArray(symbols)) return;
        if (symbols.length === 0) return;

        visit(this.tree, (node, index, parent) => {
            if (node.type !== "section") return;
            if (node.children.length !== 2) return;
            if (node.children[0].type !== "heading") return;
            if (node.children[1].type !== "paragraph") return;

            const [heading, paragraph] = node.children;
            if (heading.children.length !== 1) return;
            if (heading.children[0].type !== "text") return;
            if (!symbols.includes(heading.children[0].value)) return;

            if (paragraph.children.length !== 0) return;
            parent.children.splice(index, 1);
        });
    }

    export() {
        return this.parser.export(...arguments);
    }

    debug() {
        console.log(inspect(this.tree));
    }

    add(input) {
        if (Array.isArray(input)) {
            return this.hypergraph.add(input);
        } else if (typeof input === "string") {
            const lines = input.split(/\r?\n/);
            for (const line of lines) {
                if (this.parser.stringIsHyperedge(line)) {
                    const symbols = this.parser.stringToHyperedge(line);
                    this.hypergraph.add(symbols);
                } else {
                    return this.hypertexts.add(line);
                }
            }
        } else {
            throw new Error("Input must be a string or an array of strings");
        }
    }

    graphData() {
        return this.hypergraph.graphData(...arguments);
    }

    filter() {
        return this.hypergraph.filter(...arguments);
    }

}

GeneralSchematics.Hypergraph = Hypergraph;
GeneralSchematics.Hyperedge = Hypergraph.Hyperedge;
GeneralSchematics.Node = Hypergraph.Node;
GeneralSchematics.BridgeNode = Hypergraph.BridgeNode;
GeneralSchematics.trackUUID = Hypergraph.trackUUID;
GeneralSchematics.Parser = Parser;

*/