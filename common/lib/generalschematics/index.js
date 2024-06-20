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

        this.options = options;

        this.hypertexts = null;
        this.hypergraph = null;
        this.parser = new Parser();
        this.parse();
    }

    get onUpdate() { return this.options.onUpdate || function () { } }
    set onUpdate(value) { this.options.onUpdate = value }
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
        return this.parser.export();
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

    reset() {
        this.input = "";
        this.tree = null;
        this.hypergraph.reset();
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
