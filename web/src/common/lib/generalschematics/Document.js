import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import remarkSectionize from 'remark-sectionize'
import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { find } from 'unist-util-find'
import { visit, SKIP } from 'unist-util-visit'
import { u } from 'unist-builder'
import { h } from 'hastscript'

export default class Document {
    constructor(markdown, ns = null) {
        this.markdown = markdown.trim();
        this.ns = ns;
    }

    async parse() {
        this.lines = this.markdown.split(/\r?\n/);
        this.symbols = new Set();
        this.hyperedges = [];
        this.tree = null;
        this.file = await unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkSectionize)
            .use(this.symbolify.bind(this))
            .use(this.linkify.bind(this))
            .use(this.treeify.bind(this))
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeStringify)
            .process(this.markdown);

        this.html = this.file.value;
        return this;
    }

    linkify() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                if (node.hyperedge) return;
                if (parent.type === 'link') return;
                if (node.handled) return;

                const symbols = [];
                const tokens = node.value.split(/\s+/);
                let buffer = [];
                for (const i in tokens) {
                    const symbol = tokens[i];

                    if (this.symbols.has(symbol)) {
                        if (buffer.length > 0) {
                            let text = buffer.join(" ");
                            if (i < tokens.length - 1) text += " ";
                            if (symbols.length > 0) text = " " + text;
                            symbols.push(u('text', { handled: true }, text));
                            buffer = [];
                        }

                        const linkNode = {
                            type: 'link',
                            url: `#${symbol}`,
                            children: [{ type: 'text', value: symbol }],
                            symbols: [symbol],
                            hyperedges: this.hyperedges.filter(edge => edge.includes(symbol))
                        };

                        symbols.push(linkNode);
                    } else {
                        buffer.push(symbol);
                    }
                }

                if (buffer.length > 0) {
                    let text = buffer.join(" ");
                    if (symbols.length > 0) text = " " + text;
                    symbols.push(u('text', { handled: true }, text));
                }

                parent.children.splice(
                    index,
                    1,
                    ...symbols
                );

                return [SKIP, index];
            });
        }
    }

    symbolify() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                const arrow = /-+>/;
                if (!arrow.test(node.value)) return;
                node.hyperedge = true;

                const symbols = node.value.split(arrow).map(symbol => symbol.trim());
                for (const symbol of symbols) {
                    this.symbols.add(symbol);
                }

                this.hyperedges.push(symbols);
            });
        }
    }

    treeify() {
        return (tree) => {
            this.tree = tree;
        }
    }

    // interwingle?
    urn(edge) {
        const path = edge.join("/");
        if (this.ns) {
            return `info:${this.ns}:${path}`;
        }

        return `info:${path}`;
    }

    static async parse(markdown, ns = null) {
        const doc = new Document(markdown, ns);
        return await doc.parse();
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