import { v4 as uuidv4 } from 'uuid';
import * as utils from "@lib/utils"

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
        this.hypergraph.onUpdate({ event: "node.rename", data: this });
        return this.id;
    }

    remove() {
        this.hyperedge.nodes.splice(this.index, 1);
        this.hypergraph.onUpdate({ event: "node.remove", data: this });

        if (this.hyperedge.nodes.length === 0) {
            this.hyperedge.remove();
        }
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

        const edgeIDs = existing ? existing.edgeIDs : new Set();
        edgeIDs.add(this.hyperedge.id);
        edgeIDs.add(node.hyperedge.id);

        const edgeUUIDs = existing ? existing.edgeUUIDs : new Set();
        edgeUUIDs.add(this.hyperedge.uuid);
        edgeUUIDs.add(node.hyperedge.uuid);

        const nodeIDs = existing ? existing.nodeIDs : new Set();
        nodeIDs.add(this.id);
        nodeIDs.add(node.id);

        const nodeUUIDs = existing ? existing.nodeUUIDs : new Set();
        nodeUUIDs.add(this.uuid);
        nodeUUIDs.add(node.uuid);

        nodes.set(node.id, {
            id: node.id,
            uuid: node.uuid,
            name: node.symbol,
            color: this.hyperedge.color,
            edgeIDs,
            edgeUUIDs,
            nodeIDs,
            nodeUUIDs,
        });
    }

    context(graphData) {
        const context = {
            prev: [],
            next: [],
        };

        const next = (id) => {
            context.next.push(this.hypergraph.nodeByID(id));
        }

        const prev = (id) => {
            context.prev.push(this.hypergraph.nodeByID(id));
        }

        for (const link of graphData.links) {
            // force 3d graph modifies graphData...kinda crummy, would be better to store graphData internally rather than passing it around
            let source = link.source.id || link.source;
            let target = link.target.id || link.target;

            if (source === this.id) {
                if (link.bridge) {
                    for (const nodeId of link.nodeIDs) {
                        if (nodeId !== this.id) { next(nodeId) }
                    }
                } else {
                    next(target);
                }
            } else if (target === this.id) {
                if (link.bridge) {
                    for (const nodeId of link.nodeIDs) {
                        if (nodeId !== this.id) { prev(nodeId) }
                    }
                } else {
                    prev(source);
                }
            }
        }


        return context;
    }
}

