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