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




// I need a concept of a block
// remark-sectionize
// remark-squeeze-paragraphs
// textr -> beautiful typography
// rehype-react
// Headers -> paragraph need to be connected..or this is what I need to build
// ```hyperedges support but also just support it inline
// Think of these as different plugins you can combine together
// Ensure HTML comments still work

// useful to add
// remark-abbr -> abbreviations...a short-form of a note. *[ABBR]: Abbreviation
// remark-admonitions -> callouts
// remark-directive -> extend markdown :::directive
// remark-attr -> custom attrbiutes {a: 123, b: 456}
// remark-breaks -> soft breaks maybe matches expectations better
// remark-capitalize -> consistent symbol names
// remark-cite -> citations...using all kinds of different formats though
// remark-code-frontmatter -> weird idea
// remark-container -> interesting container idea :::
// remark-copy-linked-files -> cool...save remove files locally
// remark-defsplit -> turn references into definitions
// remark-flexible-containers -> callouts
// remark-images -> nice images
// remark-lint && remark-prettier -> might be nice
// remark-ping -> ping a @user
// remark-normalize-headings
// remark-redact -> remark-hashify -> your symbols also have a hash table /~ redacted ~/.... /~ A ~/ -> B -> C
// remark-shortcodes -> embed content
// retext-diacritics -> accents

export default class Document {
    constructor(markdown) {
        this.markdown = markdown;
    }

    async parse() {
        this.lines = this.markdown.split(/\r?\n/);
        this.hyperedges = [];
        this.tree = null;
        this.file = await unified()
            .use(remarkParse)
            .use(remarkFrontmatter, ['yaml', 'toml'])
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkBreaks)
            .use(remarkSectionize)
            .use(this.remarkHyperedges.bind(this))
            .use(this.remarkSaveTree.bind(this))
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeStringify)
            .process(this.markdown);

        this.html = this.file.value;
        return this;
    }

    remarkHyperedges() {
        return (tree) => {
            visit(tree, 'text', (node, index, parent) => {
                if (node.value.includes("->")) {
                    this.hyperedges.push(node.value.split("->").map(s => s.trim()));
                }
            });
        }
    }

    // weird...any other way to do this?
    remarkSaveTree() {
        return (tree) => {
            this.tree = tree;
        }
    }

    static async parse(markdown) {
        const doc = new Document(markdown);
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