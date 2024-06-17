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
        this.hypertexts.schematic.updateIndexes();
    }

    get owners() {
        return this.data.owners;
    }

    delete() {
        visitParents(this.hypertexts.tree, (node, parents) => {
            if (node === this.data) {
                const parent = parents[parents.length - 1];
                const index = parent.children.indexOf(node);
                parent.children.splice(index, 1);
            }
        });
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

    add(symbol, input = null) {
        if (input) {
            const data = {
                type: "paragraph",
                children: [
                    {
                        type: 'heading',
                        depth: 2,
                        children: [{ type: 'text', value: symbol }]
                    }
                ]
            };

            const section = find(this.tree, data);
            if (section) {
                if (section.children.length > 0) {
                    section.children.push({ type: 'break' });
                }

                section.children.push({ type: 'text', value: input });
            } else {
                this.tree.children.push({
                    type: 'paragraph',
                    children: [
                        data.children[0],
                        { type: 'break' },
                        { type: 'text', value: input }
                    ]
                });
            }
        } else {
            input = symbol;
            this.tree.children.push({
                type: 'paragraph',
                children: [
                    {
                        type: 'text',
                        value: input
                    }
                ]
            });
        }
    }
}