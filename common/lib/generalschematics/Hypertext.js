import Line from './Line';

export default class Hypertext extends Line {
    constructor() {
        super(...arguments);
    }

    get isHypertext() { return true }

    get hypertext() { return this.line }
    set hypertext(value) {
        this.line = value;
        this.tree.onUpdate({ event: "hypertext.update", data: this });
    }

    regex(symbol) { return new RegExp(`\\b${symbol}\\b`, "g") }
    matches(symbol) { return this.regex(symbol).test(this.hypertext) }

    get html() {
        let line = this.line;
        for (const symbol of this.ownerSymbols) {
            console.log("SYMBOL", symbol);
            line = line.replace(this.regex(symbol), `<a href="#${symbol}" class="symbol">${symbol}</a>`);
        }
        return `<div class="hypertext ${this.owners.length > 0 ? " symbol" : ""}">${line}</div>`;
    }

    //     // return `<h${this.level} class="${this.owners.length > 0 ? "symbol" : ""}">${this.line}</h${this.level}>`;
    //     return `<div class="hypertext ${this.owners.length > 0 ? " symbol" : ""}>${this.line}</div>`
    // }

    get header() {
        let curr = this, breaks = 0;
        while (curr = curr.parent) {
            if (curr.name === "emptyline") breaks++;
            else breaks = 0;

            if (curr.name !== "header") {
                if (curr.name === "hypertext") continue;
                if (breaks > 1) break;
            }

            if (curr.name === "header") {
                return curr;
            }
        }

        return null;
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

            if (curr.name === "header") break;
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

    remove(removeEmptyHeader = true) {
        const header = this.header;
        super.remove();

        this.tree.onUpdate({ event: "hypertext.remove", data: this });

        if (removeEmptyHeader && header) {
            const isEmpty = header.children.length === 0 || header.children.every(child => child.name === "emptyline");
            if (isEmpty) {
                const children = header.children;
                while (children.length > 0) {
                    children[0].remove();
                }
                header.remove();
            }
        }
    }
}


/*
import { visitParents } from 'unist-util-visit-parents'

export default class Hypertext {
    constructor(data, hypertexts) {
        this.data = data;
        this.hypertexts = hypertexts;
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