import Line from './Line';

export default class Hypertext extends Line {
    constructor() {
        super(...arguments);
    }

    get hypertext() { return this.line }
    set hypertext(value) { this.line = value }
    matches(symbol) {
        const token = new RegExp(`\\b${symbol}\\b`, "g");
        return token.test(this.hypertext);
    }

    get owners() {
        const owners = this.tree.nodes.filter(node => this.matches(node.symbol));

        const parent = this.parent;
        if (parent && parent.name === "header") {
            const nodes = this.tree.nodes.filter(node => parent.matches(node.symbol));
            for (const node of nodes) {
                if (!owners.includes(node)) owners.push(node);
            }
        }

        return owners;
    }

    get ownerSymbols() { return this.owners.map(node => node.symbol) }

    get str() {
        return `${this.index}:hypertext [${this.uuid}]\n    ${this.line}`
    }
}


/*
import { visitParents } from 'unist-util-visit-parents'

export default class Hypertext {
    constructor(data, hypertexts) {
        this.data = data;
        this.hypertexts = hypertexts;
    }

    get value() {
        return this.data.value;
    }

    set value(value) {
        this.data.value = value;
        this.hypertexts.schematic.update();
        this.schematic.onUpdate({ event: "hypertext.update", data: this });
    }

    get owners() {
        return this.data.owners;
    }

    get schematic() {
        return this.hypertexts.schematic;
    }

    remove() {
        const owners = this.owners;
        visitParents(this.hypertexts.tree, (node, parents) => {
            if (node === this.data) {
                const parent = parents[parents.length - 1];
                const index = parent.children.indexOf(node);
                parent.children.splice(index, 1);

                const data = { value: this.value, owners };

                this.schematic.onUpdate({ event: "hypertext.remove", data });
            }
        });

        this.schematic.removeEmptySections(owners);
    }
}
    */