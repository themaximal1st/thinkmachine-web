import { v4 as uuidv4 } from 'uuid';

export default class Line {
    constructor(line, tree) {
        this.line = line;
        this.tree = tree;
        this.uuid = uuidv4();
    }

    get index() {
        return this.tree.lines.indexOf(this);
    }

    get output() {
        return this.line;
    }

    get str() {
        return `${this.index}:line [${this.uuid}]\n    ${this.line}`;
    }

    static matches(line) {
        return true;
    }

    remove() {
        this.tree.lines.splice(this.index, 1);
        // TODO: trigger update
    }
}