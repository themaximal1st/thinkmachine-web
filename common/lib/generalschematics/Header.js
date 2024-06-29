
import Line from './Line';

export default class Header extends Line {

    constructor() {
        super(...arguments);
        this.level = this.line.match(/#/g).length;
    }

    get value() { return this.header }
    get header() { return this.line.replace(/#/g, "").trim() }
    set header(value) { this.line = `${"#".repeat(this.level)} ${value}` }
    get html() {
        if (this.owners.length > 0) {
            return `<h${this.level} class="symbol"><a href="#${this.header}">${this.line}</a></h${this.level}>`;
        }
        return `<h${this.level}>${this.line}</h${this.level}>`;
    }
    get str() { return `${this.index}:${this.name} [${this.uuid}]\n    ${this.level}:${this.header}` }
    static matches(line) { return line.startsWith("#") }
    get children() {
        const children = [];

        let curr = this, breaks = 0;
        while (curr = curr.child) {
            if (curr.name === "hyperedge") continue;
            if (curr.name === "emptyline") breaks++;
            else breaks = 0;
            if (breaks > 1) break;
            children.push(curr);
        }

        return children;
    }

    remove(removeChildren = false) {
        if (removeChildren) {
            const children = this.children;
            let child;
            while (child = children.pop()) { child.remove(false) }
        }

        this.tree.lines.splice(this.index, 1);
        // TODO: trigger update
    }

    add(input) {
        this.insertAt(this.children.length, input);
    }

    insertAt(index, input) {
        this.tree.parseLine(input, this.index + index + 1);
    }
}