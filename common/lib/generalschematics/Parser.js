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

export default class Parser {
    ARROW = /-+>/;

    constructor(input = "") {
        this.input = input;
        this.file = null;
        this.tree = null;
        this.hyperedges = [];
        this.symbols = new Set();
        this.hypertext = new Map();
        this.leftover = [];
    }

    async parse() {

        this.file = await unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkSectionize)
            .use(this.symbolify.bind(this))
            // .use(this.linkify.bind(this))
            .use(this.treeify.bind(this))
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeStringify)
            .process(this.input);

        this.html = this.file.value;
    }

    symbolify() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                if (!this.ARROW.test(node.value)) {
                    const tokens = this.tokenize(node.value);
                    let added = false;
                    for (const symbol of this.symbols) {
                        if (tokens.includes(symbol)) {
                            if (!this.hypertext.has(symbol)) {
                                this.hypertext.set(symbol, []);
                            }
                            this.hypertext.get(symbol).push(node.value);
                            added = true;
                        }
                    }

                    if (!added) {
                        this.leftover.push(node.value);
                    }

                    return;
                }

                const symbols = node.value.split(this.ARROW).map(symbol => symbol.trim());
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

    tokenize(text) {
        return text.split(/\s+/);
    }
}
