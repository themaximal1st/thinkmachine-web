import { find } from 'unist-util-find'
import { selectAll } from 'unist-util-select'

import Hypertext from './Hypertext.js';


export default class Hypertexts {
    constructor(schematic) {
        this.schematic = schematic
    }

    get tree() {
        return this.schematic.tree;
    }

    get(symbol) {
        return selectAll(`hypertext[owners~="${symbol}"]`, this.tree).map(node => new Hypertext(node, this));
    }

    get size() {
        return selectAll("hypertext", this.tree).length;
    }

    get global() {
        return selectAll("hypertext[owners~=global]", this.tree).map(node => new Hypertext(node, this));
    }

    get all() {
        return selectAll("hypertext", this.tree).map(node => new Hypertext(node, this));
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

        const hypertext = new Hypertext(data, this);

        this.schematic.onUpdate({ event: "hypertext.add", data: hypertext });

        return hypertext;
    }

    addLocal(symbol, input) {
        const section = this.getOrCreateSymbolSection(symbol);
        const paragraph = section.children[1];
        if (paragraph.children.length > 0) {
            paragraph.children.push({ type: "break" });
        }

        const data = { type: "hypertext", value: input };
        const hypertext = new Hypertext(data, this);

        paragraph.children.push(data);

        this.schematic.update();

        this.schematic.onUpdate({ event: "hypertext.add", data: hypertext });
    }

    add(symbol, input = null) {
        if (!input) {
            return this.addGlobal(symbol);
        }

        return this.addLocal(symbol, input);
    }
}