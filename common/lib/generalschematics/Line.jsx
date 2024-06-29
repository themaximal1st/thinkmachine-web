import { v4 as uuidv4 } from "uuid";

import Base from "./Base";

export default class Line extends Base {
    constructor(line, tree) {
        super();
        this.uuid = uuidv4();
        this.line = line;
        this.tree = tree;
    }

    get index() {
        return this.tree.lines.indexOf(this);
    }

    get output() {
        return this.line;
    }

    get dom() {
        return <div>{this.line}</div>;
    }

    get str() {
        return `${this.index}:${this.name} [${this.uuid}]\n    ${this.line}`;
    }

    static matches(line) {
        return true;
    }

    get parent() {
        return this.ancestorAt(this.index - 1);
    }

    get child() {
        return this.ancestorAt(this.index + 1);
    }

    ancestorAt(index) {
        if (index < 0) return null;
        if (index > this.tree.lines.length) return null;
        return this.tree.lines[index];
    }

    remove() {
        this.tree.lines.splice(this.index, 1);
        // TODO: trigger update
    }

    matches(symbol) {
        return this.value === symbol;
    }
    get owners() {
        return this.tree.nodes.filter((node) => this.matches(node.symbol));
    }
    get ownerSymbols() {
        return this.owners.map((node) => node.symbol);
    }
}
