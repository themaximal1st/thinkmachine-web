import { v4 as uuidv4 } from 'uuid';

export default class Node {
    constructor(symbol, hyperedge) {
        this.symbol = symbol;
        this.hyperedge = hyperedge;
        this.hypergraph = hyperedge.hypergraph;
        this.uuid = uuidv4();
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    get index() {
        return this.hyperedge.nodes.indexOf(this);
    }

    get isMasqueradeNode() {
        return this.hypergraph.masqueradeNode(this) !== this;
    }

    get isFirst() {
        return this.index === 0;
    }

    get isLast() {
        return this.index === this.hyperedge.nodes.length - 1;
    }

    get isMiddle() {
        return !this.isFirst && !this.isLast;
    }

    equal(node) {
        return this.id === node.id;
    }

    rename(symbol) {
        this.symbol = symbol;
        return this.id;
    }

    remove() {
        this.hyperedge.nodes.splice(this.index, 1);
    }

    next() {
        if (this.isLast) return null;
        return this.hyperedge.nodes[this.index + 1];
    }

    prev() {
        if (this.isFirst) return null;
        return this.hyperedge.nodes[this.index - 1];
    }

    updateGraphData(nodes, links) {
        const node = this.hypergraph.masqueradeNode(this);

        const existing = nodes.get(node.id);
        const ids = existing ? existing.ids : new Set();

        ids.add(this.hyperedge.id);

        nodes.set(node.id, {
            id: node.id,
            uuid: node.uuid,
            name: node.symbol,
            color: this.hyperedge.color,
            ids,
        });
    }
}

