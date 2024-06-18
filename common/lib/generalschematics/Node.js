import { v4 as uuidv4 } from 'uuid';

export default class Node {
    constructor(hyperedge, index) {
        this.hyperedge = hyperedge;
        this.index = parseInt(index);
        this.hypertext = {
            add: this.addHypertext.bind(this),
        };

        if (!this.data.uuid) {
            this.data.uuid = uuidv4();
        }
    }

    get id() {
        return this.hyperedge.nodeId(this.index);
    }

    get data() {
        return this.hyperedge.data.children[this.index];
    }

    get uuid() {
        return this.data.uuid;
    }

    set uuid(uuid) {
        this.data.uuid = uuid;
    }

    get value() {
        return this.data.value;
    }

    get symbol() {
        return this.value;
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

    get hypergraph() {
        return this.hyperedge.hypergraph;
    }

    get schematic() {
        return this.hypergraph.schematic;
    }

    get hypertexts() {
        return this.schematic.hypertexts.get(this.value);
    }

    rename(input) {
        this.hyperedge.rename(input, this.index);
    }

    add(input) {
        this.hyperedge.insertAt(input, this.index + 1);
    }

    insert(input) {
        this.hyperedge.insertAt(input, this.index);
    }

    remove() {
        this.hyperedge.removeAt(this.index);

        if (this.hyperedge.length === 0) {
            this.hyperedge.remove();
        }
    }

    addHypertext(input) {
        this.schematic.hypertexts.add(this.value, input);
    }

    equal(node) {
        return this.id === node.id;
    }

    equals(symbol) {
        return this.symbol.toLowerCase() === symbol.toLowerCase();
    }

    connect(node) {
        const symbols = [
            this.symbol,
            node.symbol,
        ]

        return this.hypergraph.add(symbols);
    }

    updateGraphData(nodes, links) {
        const node = this.hypergraph.masqueradeNode(this);
        const indexes = this.updateIndexes(nodes, links);

        nodes.set(node.id, {
            id: node.id,
            uuid: node.uuid,
            name: node.symbol,
            color: this.hyperedge.color,
            ...indexes
        });
    }

    updateIndexes(nodes) {
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

        return {
            edgeIDs,
            edgeUUIDs,
            nodeIDs,
            nodeUUIDs,
        }
    }

    context(graphData) {
        const context = {
            prev: [],
            next: [],
            stack: [],
        };

        const next = (id) => {
            context.next.push(this.hypergraph.nodeByID(id));
        }

        const prev = (id) => {
            context.prev.push(this.hypergraph.nodeByID(id));
        }

        const stack = (uuid) => {
            context.stack.push(this.hypergraph.nodeByUUID(uuid));
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

        for (const node of graphData.nodes) {
            if (!node.nodeUUIDs.has(this.uuid)) continue;
            for (const uuid of node.nodeUUIDs) {
                stack(uuid);
            }
        }

        return context;
    }
}

/*
import { v4 as uuidv4 } from 'uuid';
import slugify from "slugify";
import Parser from './parser.js';

export default class Node {

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

    get slugs() {
        return [
            slugify(this.symbol.toLowerCase()),
            slugify(this.symbol.toLowerCase(), "_"),
        ];
    }

    matches(input) {
        if (!input || !this.symbol) return false;
        return this.slugs.includes(slugify(input.toLowerCase()));
    }






    export() {
        return this.symbol;
    }
}


*/