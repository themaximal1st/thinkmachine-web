import Hypergraph from './Hypergraph.js';
import Hypertext from './Hypertext.js';
import Parser from './Parser.js';

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
        this.hypertext = new Hypertext(this.tree);
        this.hypergraph = new Hypergraph(this.tree);
    }

    export() {
        return this.parser.export();
    }
}