// TODO: All of this should be moved to Tree
import Tree from './Tree';

export default class Parser {
    static Tree = Tree;
    static Hypertext = Tree.Hypertext;
    static Hyperedge = Tree.Hyperedge;
    static Node = Tree.Node
    static EmptyLine = Tree.EmptyLine;
    static Header = Tree.Header;

    constructor(input = "", options = {}) {
        this.tree = new Tree(options);
        this.parse(input);
    }

    get options() { return this.tree.options }
    get hash() { return this.tree.hash }
    get edgehash() { return this.tree.edgehash }
    get texthash() { return this.tree.texthash }
    get text() { return this.tree.text }
    get input() { return this.tree.input }
    get output() { return this.tree.output }
    get html() { return this.tree.html }
    get dom() { return this.tree.dom }
    get lines() { return this.tree.lines }
    get hypertexts() { return this.tree.hypertexts }
    get hyperedges() { return this.tree.hyperedges }
    get headers() { return this.tree.headers }
    get nodes() { return this.tree.nodes }
    get symbols() { return this.tree.symbols }
    get uniqueSymbols() { return this.tree.uniqueSymbols }
    get str() { return this.tree.str }
    debug() { this.tree.debug() }
    find() { return this.tree.find(...arguments) }
    findOne() { return this.tree.findOne(...arguments) }
    walk() { return this.tree.walk(...arguments) }
    walkBack() { return this.tree.walkBack(...arguments) }
    add() { return this.tree.add(...arguments) }

    parse(input = "") {
        this.tree.reset();
        this.tree.input = input;

        // splitting on empty string returns an array with one empty string..which isn't what we want
        // and we want at least one parse event here...not totally deterministic...should fix
        if (this.tree.input === "") {
            this.tree.onUpdate({ event: "parse", data: input });
        } else {
            const lines = input.split(/\r?\n/);
            for (const index in lines) {
                this.tree.parseLine(lines[index], index);
            }
        }

        return this.tree;
    }
}