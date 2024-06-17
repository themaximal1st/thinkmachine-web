import Hypergraph from './Hypergraph.js';
import Hypertexts from './Hypertexts.js';
import Parser from './Parser.js';
import { inspect } from "unist-util-inspect"
import { visit } from 'unist-util-visit'
import { sha256 } from './utils.js';

export default class GeneralSchematics {
    constructor(input = "") {
        if (typeof input !== "string") throw new Error("Input must be a string");

        this.input = input;
        this.parser = new Parser();
        this.parse();
    }

    get hash() {
        return sha256(inspect(this.tree));
    }

    get html() {
        return this.parser.html();
    }

    get hyperedges() {
        return this.hypergraph.hyperedges;
    }

    parse() {
        this.parser.input = this.input;
        this.parser.parse();

        this.tree = this.parser.tree;
        this.update();
        this.hypertexts = new Hypertexts(this);
        this.hypergraph = new Hypergraph(this);
    }

    update() {
        this.parser.update(this.tree);
    }

    deleteEmptySections(symbols = []) {
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
}