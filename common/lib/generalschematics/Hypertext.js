import { inspect } from "unist-util-inspect"
import { find } from 'unist-util-find'
import { selectAll } from 'unist-util-select'

export default class Hypertext {
    constructor(tree) {
        this.tree = tree;
    }

    get(symbol) {
        return selectAll(`hypertext[owners~=${symbol}]`, this.tree);
    }

    get size() {
        return selectAll("text", this.tree).length;
    }

    get global() {
        return selectAll("hypertext[owners~=global]", this.tree);
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