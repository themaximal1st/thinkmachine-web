import { v4 as uuidv4 } from 'uuid';

import Node from './Node.js';
import * as utils from './utils.js';

export default class Hyperedge {
    constructor(symbols = [], hypergraph) {
        this.nodes = [];
        this.hypergraph = hypergraph;
        this.add(symbols);
        this.uuid = uuidv4();
        this.color = utils.stringToColor(this.firstNode.symbol, this.hypergraph.colors);
    }

    get id() {
        const id = this.symbols.join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }
        return id;
    }

    get nodeIds() {
        return new Set(this.nodes.map(node => node.id));
    }

    get length() {
        return this.nodes.length;
    }

    get index() {
        return this.hypergraph.hyperedges.indexOf(this);
    }

    get isFusionBridge() {
        return this.nodes.length === 2;
    }

    get symbols() {
        return this.nodes.map(node => node.symbol);
    }

    get firstNode() {
        return this.nodes[0];
    }

    get secondNode() {
        return this.nodes[1];
    }

    get lastNode() {
        return this.nodes[this.nodes.length - 1];
    }

    get middleNodes() {
        if (this.nodes.length < 3) {
            return [];
        }

        return this.nodes.slice(1, this.nodes.length - 1);
    }

    get firstNodes() {
        return this.nodes.slice(0, -1);
    }

    get lastNodes() {
        return this.nodes.slice(1);
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.hypergraph.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    add(symbol) {
        if (Array.isArray(symbol)) {
            return symbol.map(s => this.add(s));
        }

        const node = new Node(symbol, this);
        this.nodes.push(node);
        this.hypergraph.onUpdate({ event: "node.add", data: node });
        return node;
    }

    addAtIndex(symbol, index) {
        const node = new Node(symbol, this);
        this.nodes.splice(index, 0, node);
        this.hypergraph.onUpdate({ event: "node.add", data: node });
        return node;
    }

    remove() {
        this.hypergraph.hyperedges.splice(this.index, 1);
        this.hypergraph.onUpdate({ event: "hyperedge.remove", data: this });
    }

    removeIndex(idx) {
        this.nodes.splice(idx, 1);
    }

    prev() {
        if (this.index === 0) return null;
        return this.hypergraph.hyperedges[this.index - 1];
    }

    next() {
        if (this.index === this.hypergraph.hyperedges.length - 1) return null;
        return this.hypergraph.hyperedges[this.index + 1];
    }

    has(symbol) {
        if (Array.isArray(symbol)) {
            return utils.arrayContains(this.symbols, symbol);
        } else {
            return this.symbols.includes(symbol);
        }
    }

    equal(edge) {
        return this.id === edge.id;
    }

    updateGraphData(nodes, links) {
        let parent = null;

        for (const node of this.nodes) {
            node.updateGraphData(nodes, links)

            if (parent) {
                const link = this.linkData(parent, node);
                links.set(link.id, link);
            }

            parent = node;
        }
    }

    updateIndexes(nodes, links) {
        if (!this.isFusionBridge) return;

        for (const node of this.nodes) {
            node.updateIndexes(nodes, links);
        }
    }

    linkData(parent, child) {
        const edgeIDs = new Set();
        const edgeUUIDs = new Set();

        const nodeIDs = new Set();
        const nodeUUIDs = new Set();

        function updateIDs(node) {
            nodeIDs.add(node.id);
            nodeUUIDs.add(node.uuid);

            if (node.bridge) {
                for (const edge of node.hyperedges) {
                    edgeIDs.add(edge.id);
                    edgeUUIDs.add(edge.uuid);
                }
            } else {
                edgeIDs.add(node.hyperedge.id);
                edgeUUIDs.add(node.hyperedge.uuid);
            }
        }

        updateIDs(parent);
        updateIDs(child);
        parent = this.hypergraph.masqueradeNode(parent);
        child = this.hypergraph.masqueradeNode(child);
        updateIDs(parent);
        updateIDs(child);

        const link = {
            id: `${parent.id}->${child.id}`,
            source: parent.id,
            target: child.id,
            edgeIDs,
            edgeUUIDs,
            nodeIDs,
            nodeUUIDs,
            color: this.color,
        };

        if (parent.bridge || child.bridge) {
            link.bridge = true;
        }

        return link;
    }
}