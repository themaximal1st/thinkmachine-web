import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
// import remarkSectionize from 'remark-sectionize'
import remarkSectionize from './sectionize.js'
import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { remark } from 'remark'
import { find } from 'unist-util-find'
import { visit, SKIP } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'
// import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { toMarkdown } from "mdast-util-to-markdown"
import { inspect } from "unist-util-inspect"
import { matches, select, selectAll } from 'unist-util-select'

import { unified } from 'unified'

import { u } from 'unist-builder'
import { h } from 'hastscript'

export default class Parser {
    ARROW = /-+>/;

    constructor(input = "") {
        this.input = input;
        this.tree = null;
    }

    parse() {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkSectionize)
            .use(this.hyperedgeify.bind(this))
            .use(this.hypertextify.bind(this))

        this.tree = processor.parse(this.input);
        processor.runSync(this.tree);
    }

    html() {
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

    get hyperedges() {
        return selectAll('hyperedge', this.tree);
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
                if (!this.ARROW.test(node.value)) return;
                node.type = "hyperedge";
                node.children = node.value.split(this.ARROW).map(symbol => {
                    return {
                        type: "node",
                        value: symbol.trim()
                    }
                });
                delete node.value;
            });
        }
    }

    unhyperedgeify() {
        return (tree) => {
            visit(tree, 'hyperedge', (node, index, parent) => {
                node.type = "text";
                node.value = node.children.map(child => child.value).join(" -> ");
                delete node.children;
            });
        }
    }

    symbolify() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                if (!this.ARROW.test(node.value)) return;

                const symbols = node.value.split(this.ARROW).map(symbol => symbol.trim());
                for (const symbol of symbols) {
                    this.symbols.add(symbol);
                }

                this.hyperedges.push(symbols);
            });
        }
    }

    hypertextify() {
        return (tree) => {
            visitParents(tree, 'text', (node, ancestors) => {
                const parent = ancestors[ancestors.length - 1];
                if (parent.type === "heading") return;
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


        // Handle text owners
        const tokens = this.tokenize(node.value);
        for (const symbol of this.symbols) {
            if (tokens.includes(symbol)) {
                if (node.owners.includes(symbol)) continue;
                node.owners.push(symbol);
            }
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
        return text.split(/[\s\.,;:]+/).filter(token => token.length > 0);
    }

    removeSections() {
        return (tree) => {
            visit(tree, 'section', (node, index, parent) => {
                parent.children.splice(index, 1, ...node.children);
                return [SKIP, index];
            });
        }
    }

    export() {
        // clone tree
        const clonedTree = JSON.parse(JSON.stringify(this.tree));

        const tree = unified()
            .use(this.removeSections.bind(this))
            .use(this.unhyperedgeify.bind(this))
            .use(this.unhypertextify.bind(this))
            .runSync(clonedTree)

        return unified()
            .use(remarkStringify)
            .stringify(tree)
            .replace(/\\\n/g, "\n") // hack: soft breaks...not clear how to force stringify to not escape them
            .trim()
    }
}
