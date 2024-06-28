import Line from './Line';
import Node from './Node';
import { arrayContains, stringToColor } from './utils';

export default class Hyperedge extends Line {
    static ARROW = /-+>|→/;

    constructor() {
        super(...arguments);
        this.nodes = [];
        this.add(Hyperedge.parse(this.line));
    }

    get id() {
        const id = this.symbols.join(".");
        if (this.tree.isIsolated) { return `${this.index}:${id}` }
        return id;
    }

    equal(edge) { return this.id === edge.id }
    get length() { return this.nodes.length }
    get symbols() { return this.nodes.map(node => node.symbol) }
    get firstNode() { return this.nodes[0] }
    get secondNode() { return this.nodes[1] }
    get lastNode() { return this.nodes[this.nodes.length - 1] }
    get firstNodes() { return this.nodes.slice(0, -1) }
    get lastNodes() { return this.nodes.slice(1) }
    get middleNodes() {
        if (this.nodes.length < 3) { return [] }
        return this.nodes.slice(1, this.nodes.length - 1);
    }
    get isFusionBridge() { return this.length === 2 }
    get nodeIds() { return this.nodes.map(node => node.id) }
    get color() {
        return stringToColor(this.firstNode.symbol, this.tree.colors);
    }

    nodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        if (this.tree.isIsolated) {
            return `${this.index}:${id}`;
        }

        return id;
    }

    uniqueNodeId(index) {
        const id = this.symbols.slice(0, index + 1).join(".");
        return `${this.index}:${id}`;
    }

    add(symbol) {
        if (Array.isArray(symbol)) {
            return symbol.map(s => this.add(s));
        }

        return this.insertAt(symbol, this.nodes.length);
    }

    insertAt(symbol, index) {
        if (index > this.nodes.length) {
            index = this.nodes.length;
        }

        const node = new Node(symbol, this);
        this.nodes.splice(index, 0, node);

        // this.updateNodeIndexes();

        this.tree.onUpdate({ event: "node.add", data: node });

        return node;
    }

    equals(edge) {
        if (Array.isArray(edge)) {
            return edge.every((symbol, i) => this.nodes[i].symbol === symbol);
        } else if (edge instanceof Hyperedge) {
            return edge.symbols.every((symbol, i) => this.nodes[i].symbol === symbol);
        }

        return false;
    }

    has(symbol) {
        if (Array.isArray(symbol)) {
            return arrayContains(this.symbols, symbol);
        } else {
            return this.symbols.includes(symbol);
        }
    }

    remove() {
        const data = this;
        super.remove();
        this.tree.onUpdate({ event: "hyperedge.remove", data });
    }


    removeAt(index) {
        const node = this.nodes[index];
        this.nodes.splice(index, 1);
        this.tree.onUpdate({ event: "node.remove", data: node });
        // this.updateNodeIndexes();
    }

    filter(input) {
        const matches = this.nodes.map(node => node.filter(input)).filter(l => l);

        const match = super.filter(input);
        if (match) matches.push(match);

        return matches;
    }


    get str() {
        return `${this.index}:hyperedge [${this.uuid}]\n    ${this.nodes.map(node => node.str).join("\n    ")}`;
    }

    get output() {
        return this.nodes.map(node => node.output).join(" -> ");
    }

    static matches(line) {
        return Hyperedge.ARROW.test(line);
    }

    static parse(line) {
        return line.split("->").map(s => s.trim());
    }
}

/*
import { v4 as uuidv4 } from 'uuid';
import { stringToColor, arrayContains } from './utils.js';

export default class Hyperedge {
    constructor(data = {}, hypergraph) {
        this.data = data;

        if (!this.data.uuid) {
            this.data.uuid = uuidv4();
        }

        this.hypergraph = hypergraph;
        this.nodes = [];
        this.build();
    }

    build() {
        for (const i in this.data.children) {
            this.nodes.push(new Node(this, i));
        }
    }

    rename(input, index) {
        this.data.children[index].value = input;
        this.schematic.update();
        this.schematic.onUpdate({ event: "node.rename", data: this.nodes[index] });
    }


    updateNodeIndexes() {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].index = i;
        }

        this.schematic.update();
    }

    static make(hyperedge) {
        return {
            type: "hyperedge",
            children: hyperedge.map(symbol => {
                return { type: "node", value: symbol }
            })
        };
    }
}
    */

/*
import { v4 as uuidv4 } from 'uuid';

import Node from './Node.js';
import * as utils from './utils.js';

export default class Hyperedge {
    constructor(symbols = [], hypergraph) {
        this.nodes = [];
        this.hypergraph = hypergraph;
        this.add(symbols);
        this.uuid = uuidv4();
    }

    prev() {
        if (this.index === 0) return null;
        return this.hypergraph.hyperedges[this.index - 1];
    }

    next() {
        if (this.index === this.hypergraph.hyperedges.length - 1) return null;
        return this.hypergraph.hyperedges[this.index + 1];
    }






    export() {
        return this.nodes.map(node => node.export())
    }
}
    */