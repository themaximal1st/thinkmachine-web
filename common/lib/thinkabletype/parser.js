// import parseEnvString from "parse-env-string"
import showdown from "showdown";

export default class Parser {
    CONNECTION = "->";
    ALIAS = "=";
    PROPERTY = "<-";

    constructor(input = "") {
        this.input = input.trim();
        this.markdown = "";
        this.hyperedges = [];
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
        if (this.parseHyperedge(line)) return;

        if (this.markdown.length > 0) {
            this.markdown += "\n";
        }

        this.markdown += line;
    }

    parseHyperedge(line) {
        if (line.includes(this.PROPERTY)) {
            // const symbols = line.split(this.PROPERTY);
            // this.hyperedges.push(symbols);
            // return true;
        }

        if (line.includes(this.CONNECTION)) {
            const symbols = line.split(/\s*->\s*/);
            this.hyperedges.push(symbols);
            return true;
        }
    }
}