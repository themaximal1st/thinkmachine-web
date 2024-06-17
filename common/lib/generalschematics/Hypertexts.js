import { inspect } from "unist-util-inspect"
import { find } from 'unist-util-find'
import { selectAll } from 'unist-util-select'
import { visitParents } from 'unist-util-visit-parents'

class Hypertext {
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
    }

    get owners() {
        return this.data.owners;
    }

    get schematic() {
        return this.hypertexts.schematic;
    }

    delete() {
        const owners = this.owners;
        visitParents(this.hypertexts.tree, (node, parents) => {
            if (node === this.data) {
                const parent = parents[parents.length - 1];
                const index = parent.children.indexOf(node);
                parent.children.splice(index, 1);
            }
        });

        this.schematic.deleteEmptySections(owners);
    }
}


export default class Hypertexts {
    constructor(schematic) {
        this.schematic = schematic
    }

    get tree() {
        return this.schematic.tree;
    }

    get(symbol) {
        return selectAll(`hypertext[owners~=${symbol}]`, this.tree).map(node => new Hypertext(node, this));
    }

    get size() {
        return selectAll("text", this.tree).length;
    }

    get global() {
        return selectAll("hypertext[owners~=global]", this.tree).map(node => new Hypertext(node, this));
    }

    getSymbolSection(symbol) {
        return find(this.tree, {
            type: "section",
            children: [{ type: "heading", children: [{ type: "text", value: symbol }] }, { type: "paragraph" }]
        });
    }

    getOrCreateSymbolSection(symbol) {
        const section = this.getSymbolSection(symbol);
        if (section) return section;

        this.tree.children.push({
            type: "section",
            children: [
                { type: "heading", depth: 2, children: [{ type: "text", value: symbol }] },
                { type: "paragraph", children: [] }
            ]
        });

        return this.getSymbolSection(symbol);
    }

    addGlobal(input) {
        const data = { type: 'hypertext', value: input };

        this.tree.children.push({
            type: 'paragraph',
            children: [data]
        });

        this.schematic.update();

        return new Hypertext(data, this);
    }

    addLocal(symbol, input) {
        const section = this.getOrCreateSymbolSection(symbol);
        const paragraph = section.children[1];
        if (paragraph.children.length > 0) {
            paragraph.children.push({ type: "break" });
        }

        paragraph.children.push({ type: "hypertext", value: input });

        this.schematic.update();
    }

    add(symbol, input = null) {
        if (!input) {
            return this.addGlobal(symbol);
        }

        return this.addLocal(symbol, input);
    }
}