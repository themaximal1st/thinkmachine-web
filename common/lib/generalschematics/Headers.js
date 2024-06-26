import Header from "./Header";

export default class Headers {
    constructor(tree) {
        this.tree = tree;
    }

    get all() { return this.tree.lines.filter(line => line instanceof Header) }
    get global() { return this.all.filter(h => h.owners.length === 0) }
    get local() { return this.all.filter(h => h.owners.length > 0) }
    get(symbol) { return this.local.filter(h => h.ownerSymbols.includes(symbol)) }
    // TODO
    // add(input) { return this.tree.add(input) }
}
