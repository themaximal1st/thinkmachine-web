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

    get headerOwners() {
        const owners = [];

        let curr = this, breaks = 0;
        while (curr = curr.parent) {
            if (curr.name === "emptyline") breaks++;
            else breaks = 0;

            if (curr.name !== "header") {
                if (curr.name === "hypertext") continue;
                if (breaks > 1) break;
            }

            const nodes = this.tree.nodes.filter(node => curr.matches(node.symbol));
            for (const node of nodes) {
                if (!owners.includes(node)) owners.push(node);
            }
        }

        return owners;
    }

    get hypertextOwners() {
        return this.tree.nodes.filter(node => this.matches(node.symbol)).flat();
    }

    get owners() {
        const owners = [...this.headerOwners, ...this.hypertextOwners];
        const uniq = [];
        for (const o of owners) {
            if (!uniq.includes(o)) uniq.push(o);
        }
        return uniq;
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