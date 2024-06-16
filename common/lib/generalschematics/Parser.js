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
import { remark } from 'remark'
import { find } from 'unist-util-find'
import { visit, SKIP } from 'unist-util-visit'
import { visitParents } from 'unist-util-visit-parents'
// import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { toMarkdown } from "mdast-util-to-markdown"

import { unified } from 'unified'

import { u } from 'unist-builder'
import { h } from 'hastscript'

export default class Parser {
    ARROW = /-+>/;

    constructor(input = "") {
        this.input = input;
    }

    parse() {
        this.file = null;
        this.tree = null;
        this.hyperedges = [];
        this.symbols = new Set();
        this.hypertext = new Map();

        this.file = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkSectionize)
            .use(this.symbolify.bind(this))
            .use(this.hypertextify.bind(this))
            .use(this.treeify.bind(this))
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeStringify)
            .processSync(this.input);

        this.html = this.file.value;
    }

    symbolify() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                if (!this.ARROW.test(node.value)) return;

                const symbols = node.value.split(this.ARROW).map(symbol => symbol.trim());
                for (const symbol of symbols) {
                    this.symbols.add(symbol);

                    if (!this.hypertext.has(symbol)) {
                        this.hypertext.set(symbol, []);
                    }
                }

                this.hyperedges.push(symbols);
            });
        }
    }

    hypertextify() {
        return (tree) => {
            visitParents(tree, 'text', (node, ancestors) => {
                if (this.ARROW.test(node.value)) return;

                const parent = ancestors[ancestors.length - 1];
                const grandparent = ancestors[ancestors.length - 2];

                if (parent.type === "heading" && grandparent.type === "section" && this.symbols.has(node.value)) {
                    const symbol = node.value;
                    visit(grandparent, 'text', (node, index, parent) => {
                        if (parent.type === "heading") return;
                        this.hypertext.get(symbol).push(node.value);
                    });
                    return;
                }

                const tokens = this.tokenize(node.value);
                for (const symbol of this.symbols) {
                    if (tokens.includes(symbol)) {
                        this.hypertext.get(symbol).push(node.value);
                    }
                }
            });
        }
    }

    hypertextifySection(node, index, parent) {

    }

    treeify() {
        return (tree) => {
            this.tree = tree;
        }
    }

    tokenize(text) {
        return text.split(/\s+/);
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
            .use(remarkStringify)
            .runSync(clonedTree)


        return unified()
            .use(remarkStringify)
            .stringify(tree)
            .trim()
    }
}
