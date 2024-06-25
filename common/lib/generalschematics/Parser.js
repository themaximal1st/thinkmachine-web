import { v4 as uuidv4 } from 'uuid';

class LineABC {
    constructor(line) {
        this.line = line;
        this.uuid = uuidv4();
    }
}

class Hypertext extends LineABC {
    constructor(line) {
        // super(line);
        this.hypertext = this.line;
    }
}

class Hyperedge {
    constructor(line) {
        this.symbols = this.line.split("->").map(s => s.trim());
    }
}

export default class Parser {
    constructor(input = "") {
        this.input = "";
        this.lines = new Map();
        this.parse(input);
    }

    get arrayLines() {
        return Array.from(this.lines.values());
    }

    get hypertexts() {
        console.log("HYPERTEXST", this.arrayLines);
        return this.arrayLines.filter(line => line instanceof Hypertext);
    }

    get hyperedges() {
        return this.arrayLines.filter(line => line instanceof Hyperedge);
    }

    get nodes() {
        return this.arrayLines.filter(line => line instanceof Node);
    }

    get symbols() {
        return this.hyperedges.flatMap(line => line.symbols);
    }

    get output() {
        const output = [];
        for (const line of this.lines.values()) {
            output.push(line.line);
        }
        return output.join("\n");
    }

    parse(input) {
        this.input = input;
        this.oldLines = this.lines;
        this.lines = new Map();
        for (const line of input.split("\n")) {
            this.parseLine(line);
        }

        return this.lines;
    }

    parseLine(line) {
        // const oldLine = this.oldLines.get(line);
        // if (oldLine) {
        //     this.lines.set(line, oldLine);
        //     return;
        // }

        this.lines.set(line, new Hypertext(line));
    }

    update() {

    }

    updateLine() {

    }

    debug() {
        console.log("LINES", this.arrayLines);
        for (const line of this.lines.values()) {
            console.log("LINE", line);
        }
    }
}

/*
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import rehypeParse from 'rehype-parse'
// import slate from 'remark-slate';
import rehypeRemark from 'rehype-remark'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import remarkSectionize from './sectionize.js'
import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { visit, SKIP } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'
import remarkStringify from 'remark-stringify'
import { inspect } from "unist-util-inspect"
import { selectAll } from 'unist-util-select'
import { find } from 'unist-util-find'
// import { serialize } from "remark-slate";
import { decodeHTMLEntities } from './utils.js'

export default class Parser {
    ARROW = /-+>|→/;

    constructor() {
        this.schematic = null;
        this.input = "";
        this.tree = null;
        this.lastTree = null;
        this.hyperedges = []; // used for uid index
    }

    parse() {
        this.lastTree = this.tree;
        this.hyperedges = [];

        const processor = unified()
            .use(remarkParse)
            .use(remarkBreaks)
            .use(remarkSectionize)
            .use(this.hyperedgeify.bind(this))
            .use(this.hypertextify.bind(this))

        this.tree = processor.parse(this.input);
        processor.runSync(this.tree);
    }

    html() {
        // clone tree
        const clonedTree = JSON.parse(JSON.stringify(this.tree));

        const processor = unified()
            .use(this.removeSections.bind(this))
            .use(this.unhyperedgeify.bind(this))
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeStringify)

        const tree = processor.runSync(clonedTree);
        return processor.stringify(tree);
    }

    parseHTML(html) {
        console.log("PARSING HTML", html);

        const file = unified()
            .use(rehypeParse)
            .use(rehypeRemark)
            .use(remarkStringify)
            .processSync(html)

        return file.value.trim();
    }

    get nodes() {
        return selectAll('node', this.tree);
    }

    get symbols() {
        return this.nodes.map(node => node.value);
    }

    hyperedgeify() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                if (node.children && node.children.length > 0) return;
                if (!this.stringIsHyperedge(node.value)) return;

                const symbols = this.stringToHyperedge(node.value);

                const edge = this.edgeFromLastTree(symbols);
                const uuid = edge ? edge.uuid : null;

                node.type = "hyperedge";
                node.uuid = uuid;

                this.hyperedges.push(symbols);
                const edgeIndex = this.hyperedges.length - 1;
                let uid;


                node.children = symbols.map((symbol, i) => {
                    if (!uid) {
                        uid = `${edgeIndex}:${symbol}`;
                    } else {
                        uid += `.${symbol}`;
                    }

                    let uuid = null;
                    if (this.hypergraph) {
                        const n = this.hypergraph.nodeByUID(uid);
                        if (n) {
                            uuid = n.uuid;
                        }
                    }

                    return {
                        type: "node",
                        value: symbol.trim(),
                        uuid,
                    }
                });

                delete node.value;
            });
        }
    }

    edgeFromLastTree(symbols) {
        if (!this.lastTree) return null;
        const children = symbols.map(symbol => {
            return { type: "node", value: symbol }
        });

        const edge = find(this.lastTree, { type: "hyperedge", children });
        if (!edge) return null;

        return edge;
    }

    unhyperedgeify(opts = {}) {
        const arrow = opts.arrow || "->";

        return (tree) => {
            visit(tree, 'hyperedge', (node, index, parent) => {
                node.type = "text";
                node.value = node.children.map(child => child.value).join(` ${arrow} `);
                delete node.children;
            });
        }
    }

    stringIsHyperedge(string) {
        return this.ARROW.test(string);
    }

    stringToHyperedge(string) {
        return string.split(this.ARROW).map(symbol => symbol.trim());
    }

    hypertextify() {
        return (tree) => {
            visitParents(tree, 'text', (node, ancestors) => {
                const parent = ancestors[ancestors.length - 1];
                if (parent.type === "heading") return;

                // console.log(inspect(node));

                node.type = "hypertext";
            });
        }
    }

    update(tree) {
        visitParents(tree, 'hypertext', (node, ancestors) => {
            this.updateOwners(node, ancestors);
        });
    }

    updateOwners(node, ancestors) {
        node.owners = [];

        // Handle header owners
        for (const ancestor of ancestors) {
            if (ancestor.type !== "section") continue;
            if (ancestor.children[0].type !== "heading") continue;

            const heading = ancestor.children[0];
            if (!heading.children) continue;
            if (heading.children.length !== 1) continue;
            if (heading.children[0].type !== "text") continue;

            const symbol = heading.children[0].value;
            if (!this.symbols.includes(symbol)) continue;
            if (node.owners.includes(symbol)) continue;
            node.owners.push(symbol);
        }

        for (const symbol of this.symbols) {
            if (node.owners.includes(symbol)) continue;
            const token = new RegExp(`\\b${symbol}\\b`, "g");
            if (!token.test(node.value)) continue;
            node.owners.push(symbol);
        }

        if (node.owners.length === 0) {
            node.owners.push("global");
        }
    }

    unhypertextify() {
        return (tree) => {
            visit(tree, 'hypertext', (node, index, parent) => {
                node.type = "text";
            });
        }
    }

    tokenize(text) {
        return text.split(/[\s\.,;:?!—()/]+/).filter(token => token.length > 0);
    }

    removeSections() {
        return (tree) => {
            visit(tree, 'section', (node, index, parent) => {
                parent.children.splice(index, 1, ...node.children);
                return [SKIP, index];
            });
        }
    }

    export(opts = {}) {
        // clone tree
        const clonedTree = JSON.parse(JSON.stringify(this.tree));

        const tree = unified()
            .use(() => this.removeSections(opts))
            .use(() => this.unhyperedgeify(opts))
            .use(() => this.unhypertextify(opts))
            .runSync(clonedTree)

        return decodeHTMLEntities(
            unified()
                .use(remarkStringify)
                .stringify(tree)
                .replace(/\\\n/g, "\n") // hack: soft breaks...not clear how to force stringify to not escape them
                .replace(/\n?$/, "")) // ensure newline at end
    }
}

*/