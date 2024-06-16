import Hypergraph from './Hypergraph.js';
import Parser from './Parser.js';


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
    }

    get hyperedges() {
        return this.parser.hyperedges;
    }

    async parse() {
        this.parser.input = this.input;
        await this.parser.parse();

        this.html = this.parser.html;
        this.hypertext = this.parser.hypertext;
        this.leftover = this.parser.leftover;
        this.hypergraph = new Hypergraph(this.hyperedges);
    }

    export() {
        let buffer = "";
        buffer += this.hypergraph.export();
        for (const [symbol, hypertext] of this.hypertext) {
            if (buffer) buffer += "\n";
            buffer += `${hypertext.join("\n")}`;
        }

        for (const leftover of this.leftover) {
            if (buffer) buffer += "\n";
            buffer += leftover;
        }

        return buffer;
    }
}