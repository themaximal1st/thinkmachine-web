import Hypergraph from './Hypergraph.js';
import Hypertexts from './Hypertexts.js';
import Parser from './Parser.js';
import { inspect } from "unist-util-inspect"

export default class GeneralSchematics {
    constructor(input = "") {
        if (typeof input !== "string") throw new Error("Input must be a string");

        this.input = input;
        this.parser = new Parser();
        this.parse();
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
        this.updateIndexes();
        this.hypertexts = new Hypertexts(this);
        this.hypergraph = new Hypergraph(this);
    }

    updateIndexes() {
        this.parser.updateIndexes(this.tree);
    }

    export() {
        return this.parser.export();
    }

    debug() {
        console.log(inspect(this.tree));
    }
}