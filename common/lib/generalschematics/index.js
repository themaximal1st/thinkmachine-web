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
        // TODO: Switch to update
    }

    addHypertext(symbol, text) {
        const paragraph = {
            type: "paragraph",
            children: [{ type: "text", value: text }]
        };

        const node = find(this.tree, {
            type: "section",
            children: [
                { type: "heading", children: [{ type: "text", value: symbol }] }
            ]
        });

        if (node) {
            node.children.push(paragraph);
        } else {

            this.tree.children.push({
                type: "section",
                depth: 1,
                children: [
                    {
                        type: "heading",
                        depth: 2,
                        children: [{ type: "text", value: symbol }]
                    },
                    paragraph
                ]
            })
        }

        this.update();
    }


    setHypertext(symbol, text) {
        const node = find(this.tree, {
            type: "section",
            children: [
                { type: "heading", children: [{ type: "text", value: symbol }] }
            ]
        });

        if (node) {
            node.children = node.children.filter(child => child.type !== "paragraph");
            node.children.push({
                type: "paragraph",
                children: [{ type: "text", value: text }]
            });

            this.update();
        } else {
            this.addHypertext(symbol, text);
        }
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

    update() {
        this.input = this.export();
        this.parse();
    }

    export() {
        return this.parser.export();
    }
}