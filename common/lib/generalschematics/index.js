import Hypergraph from './Hypergraph.js';
import Parser from './Parser.js';
import { find } from 'unist-util-find'


export default class GeneralSchematics {
    constructor(input) {
        if (typeof input !== "string") throw new Error("Input must be a string");

        this.input = input;
        this.parser = new Parser();
        this.tree = null;
        this.markdown = null;
        this.html = null;
        this.hypergraph = null;
        this.hypertext = new Map();

        this.parse();

    }

    add(input) {
        if (typeof input === "string") {
            this.input += "\n\n" + input;
        } else if (Array.isArray(input)) {
            if (Array.isArray(input[0])) {
                for (const line of input) {
                    this.input += "\n\n" + line.join(" -> ");
                }
            } else {
                this.input += "\n\n" + input.join(" -> ");
            }
        } else {
            throw new Error("Input must be a string or array");
        }

        this.parse();
    }

    addHypertext(symbol, text) {
        this.input += "\n\n# " + symbol + "\n" + text;
        this.parse();
    }

    get hyperedges() {
        return this.parser.hyperedges;
    }

    parse() {
        this.parser.input = this.input;
        this.parser.parse();

        this.tree = this.parser.tree;
        this.html = this.parser.html;
        this.hypertext = this.parser.hypertext;
        this.hypergraph = new Hypergraph(this.hyperedges);
    }

    export() {
        return this.parser.export();
    }
}