import showdown from "showdown";

function makeHTML(markdown) {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdown);
}

export default class Document {
    constructor(input) {
        this.input = input;
        this.parse()
    }

    parse() {
        this.lines = this.input.split(/\r?\n/);
        this.hyperedges = this.lines.filter(line => line.includes("->")).map(line => line.split("->").map(s => s.trim()));
        this.markdown = this.input;
        this.html = makeHTML(this.markdown);
    }
}






























/*
export default class Parser {
    CONNECTION = "->";
    ALIAS = "=";
    PROPERTY = "<-";

    constructor(input = "") {
        this.input = input.trim();
        this.markdown = "";
        this.hyperedges = [];
        this.alias = new Map();
        this.parse();
    }


    get html() {
        this.parse();
        const converter = new showdown.Converter();
        return converter.makeHtml(this.markdown);
    }

    get lines() {
        return this.input.trim().split(/\r?\n/);
    }

    parse() {
        if (this.parsed) return;


        for (let i in this.lines) {
            this.parseLine(this.lines[i]);
        }

        this.parsed = true;
    }

    parseLine(line) {
        if (this.parseAlias(line)) return;
        if (this.parseHyperedge(line)) return;

        if (this.markdown.length > 0) {
            this.markdown += "\n";
        }

        this.markdown += line;
    }

    parseAlias(line) {
        if (line.includes(this.ALIAS) && line.match(/^[A-Za-z0-9\s]+=/)) {
            const symbols = line.split(this.ALIAS);
            this.alias.set(symbols[0], symbols[1]);
            return true;
        }
    }

    parseHyperedge(line) {
        if (line.includes(this.PROPERTY)) {
            // const symbols = line.split(this.PROPERTY);
            // this.hyperedges.push(symbols);
            // return true;
        }

        if (line.includes(this.CONNECTION)) {

            this.hyperedges.push(symbols);
            return true;
        }
    }
}
    */