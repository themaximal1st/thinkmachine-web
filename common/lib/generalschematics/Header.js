
import Line from './Line';

export default class Header extends Line {

    constructor() {
        super(...arguments);
        this.level = this.line.match(/#/g).length;
    }

    get value() { return this.header }
    get header() { return this.line.replace(/#/g, "").trim() }
    set header(value) { this.line = `${"#".repeat(this.level)} ${value}` }
    get str() { return `${this.index}:${this.constructor.name.toLowerCase()} [${this.uuid}]\n    ${this.level}:${this.header}` }
    static matches(line) { return line.startsWith("#") }
}