import csv from "papaparse"

import Hyperedge from './Hyperedge.js';
import Node from './Node.js';
import BridgeNode from './BridgeNode.js';
import Colors from "./colors.js";
import * as utils from "./utils.js";
import FilterGraph from "./FilterGraph.js";

export default class Hypergraph {
    static INTERWINGLE = {
        ISOLATED: 0,        // only explicit connections you've added
        CONFLUENCE: 1,      // shared parents
        FUSION: 2,          // shared children
        BRIDGE: 3           // shared symbols
    };

    static DEPTH = {
        SHALLOW: 0,         // don't connect
        // any number between 1 and Infinity is valid, up to maxDepth
        DEEP: Infinity,     // infinitely connect
    };

    constructor(input, options = {}) {
        let hyperedges;

        if (Array.isArray(input)) {
            hyperedges = input;
        } else if (typeof input === "object") {
            hyperedges = input.hyperedges || [];
            delete input.hyperedges;
            options = input;
        } else {
            hyperedges = [];
        }

        options.interwingle = options.interwingle || Hypergraph.INTERWINGLE.ISOLATED;
        options.depth = options.depth || Hypergraph.DEPTH.SHALLOW;
        options.colors = options.colors || Colors;
        this.options = options;

        this.hyperedges = [];
        this.add(hyperedges);
    }

    get interwingle() { return this.options.interwingle }
    set interwingle(value) { this.options.interwingle = value }
    get depth() { return this.options.depth }
    set depth(value) { this.options.depth = value }
    get colors() { return this.options.colors }
    set colors(value) { this.options.colors = value }
    get isIsolated() { return this.interwingle === Hypergraph.INTERWINGLE.ISOLATED }
    get isConfluence() { return this.interwingle >= Hypergraph.INTERWINGLE.CONFLUENCE }
    get isFusion() { return this.interwingle >= Hypergraph.INTERWINGLE.FUSION }
    get isBridge() { return this.interwingle >= Hypergraph.INTERWINGLE.BRIDGE }
    get onUpdate() { return this.options.onUpdate || function () { } }
    set onUpdate(value) { this.options.onUpdate = value }
    get nodes() {
        const nodes = [];
        for (const hyperedge of this.hyperedges) {
            for (const node of hyperedge.nodes) {
                nodes.push(node);
            }
        }
        return nodes;
    }
    get symbols() {
        return this.hyperedges.map(hyperedge => hyperedge.symbols);
    }
    get uniqueSymbols() {
        return new Set(this.symbols.flat());
    }
    get hash() {
        return utils.hash(this.export());
    }

    add(symbols) {
        if (!Array.isArray(symbols)) throw new Error("Expected an array of symbols");
        if (symbols.length === 0) return;
        if (Array.isArray(symbols[0])) {
            return symbols.map(symbols => this.add(symbols));
        }

        const hyperedge = new Hyperedge(symbols, this);
        this.hyperedges.push(hyperedge);
        this.onUpdate({ event: "hyperedge.add", data: hyperedge });
        return hyperedge;
    }

    get(symbols) {
        for (const hyperedge of this.hyperedges) {
            if (utils.arrayContains(hyperedge.symbols, symbols)) {
                return hyperedge;
            }
        }

        return null;
    }

    has(symbol) {
        if (Array.isArray(symbol)) {
            return !!this.get(symbol);
        } else {
            return this.uniqueSymbols.has(symbol);
        }
    }

    filter(symbols) {
        if (symbols.length === 0) return [];
        if (!Array.isArray(symbols[0])) {
            symbols = [symbols];
        }

        return this.hyperedges.filter(hyperedge => {
            for (const symbol of symbols) {
                if (hyperedge.has(symbol)) {
                    return true;
                }
            }

            return false;
        });
    }

    static parse(input, options = {}) {
        const graph = new Hypergraph(options);
        graph.parse(input, options);
        return graph;
    }

    parse(input, options = {}) {
        this.reset();
        const hyperedges = csv.parse(input.trim(), options.parse || {}).data;
        this.add(hyperedges);
    }

    reset() {
        this.hyperedges = [];

        this.symbolIndex = new Map();
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();

        this.fusionIndex = new Map();

        this.onUpdate({ event: "hypergraph.reset" });
    }


    nodeByUUID(uuid) {
        for (const hyperedge of this.hyperedges) {
            for (const node of hyperedge.nodes) {
                if (node.uuid === uuid) return node;
            }
        }
    }

    nodeByID(id) {
        for (const hyperedge of this.hyperedges) {
            for (const node of hyperedge.nodes) {
                if (node.id === id) return node;
            }
        }
    }

    edgeByUUID(uuid) {
        for (const hyperedge of this.hyperedges) {
            if (hyperedge.uuid === uuid) return hyperedge;
        }
    }

    masqueradeNode(node, max = 1000) {
        let i = 0;

        while (true) {
            if (i++ > max) {
                console.log("Infinite loop for", node.id)
                throw new Error("Infinite loop");
            }

            const masqueradeNode = this.fusionIndex.get(node.id);
            if (!masqueradeNode || masqueradeNode.uuid === node.uuid) {
                return node;
            }

            node = masqueradeNode;
        }
    }

    graphData(filter = null, lastData = null) {
        const nodes = new Map();
        const links = new Map();

        this.updateIndexes();

        for (const hyperedge of this.hyperedges) {
            if (this.isFusion && hyperedge.isFusionBridge) {
                // hyperedge.updateIndexes(nodes, links);
            } else {
                hyperedge.updateGraphData(nodes, links);
            }
        }

        if (lastData) {
            utils.restoreData({ nodes, links }, lastData);
        }

        if (this.isFusion) {
            this.updateFusionData(nodes, links);
        }

        if (this.isBridge) {
            this.updateBridgeData(nodes, links);
        }

        utils.verifyGraphData(nodes, links);

        if (Array.isArray(filter) && filter.length > 0) {
            return FilterGraph({
                filter,
                hyperedges: this.hyperedges,
                graphData: { nodes, links },
                depth: this.depth
            });
        }

        return {
            nodes: Array.from(nodes.values()),
            links: Array.from(links.values()),
        };
    }

    updateIndexes() {
        this.symbolIndex = new Map();
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();

        this.fusionIndex = new Map();

        for (const edge of this.hyperedges) {
            for (const node of edge.nodes) {
                utils.addIndex(this.symbolIndex, node.symbol, node);
            }

            utils.addIndex(this.startSymbolIndex, edge.firstNode.symbol, edge.firstNode);
            utils.addIndex(this.endSymbolIndex, edge.lastNode.symbol, edge.lastNode);
        }

        if (!this.isFusion) { return }

        for (const edge of this.hyperedges) {
            let nodes;

            // start fusion
            nodes = this.endSymbolIndex.get(edge.firstNode.symbol) || [];
            if (nodes.length > 0) {
                this.fusionIndex.set(edge.firstNode.id, nodes[0]); // should this crawl to edge and lastNode?
            }

            // end fusion
            nodes = this.endSymbolIndex.get(edge.lastNode.symbol) || [];
            if (nodes.length > 0) {
                this.fusionIndex.set(edge.lastNode.id, nodes[0]);
            }
        }
    }

    fusionBridgeNodes(node) {
        const nodes = this.symbolIndex.get(node.symbol) || [];
        return nodes.filter(n => { return n.hyperedge.uuid !== node.hyperedge.uuid });
    }

    updateFusionData(nodes, links) {

        for (const hyperedge of this.hyperedges) {
            if (!hyperedge.isFusionBridge) continue;

            const fromNodes = this.fusionBridgeNodes(hyperedge.firstNode);
            const toNodes = this.fusionBridgeNodes(hyperedge.lastNode);

            // no connections...but ensure the edge exists
            if (fromNodes.length === 0 && toNodes.length === 0) {
                hyperedge.updateGraphData(nodes, links);
                hyperedge.updateIndexes(nodes, links);
                continue;
            }

            // if one side of the connection doesn't exist, create it
            if (fromNodes.length === 0 && toNodes.length > 0) {
                hyperedge.firstNode.updateGraphData(nodes, links);
                fromNodes.push(hyperedge.firstNode);
            }

            if (fromNodes.length > 0 && toNodes.length === 0) {
                hyperedge.lastNode.updateGraphData(nodes, links);
                toNodes.push(hyperedge.lastNode);
            }

            for (let fromNode of fromNodes) {
                fromNode = this.masqueradeNode(fromNode);

                for (let toNode of toNodes) {
                    toNode = this.masqueradeNode(toNode);

                    if (!nodes.has(fromNode.id)) { fromNode.updateGraphData(nodes, links) }
                    if (!nodes.has(toNode.id)) { toNode.updateGraphData(nodes, links) }

                    const linkData = hyperedge.linkData(fromNode, toNode);
                    links.set(linkData.id, linkData);
                }
            }

            hyperedge.updateIndexes(nodes, links);
        }
    }

    updateBridgeData(nodes, links) {
        const bridgeIndex = new Map();

        for (const hyperedge of this.hyperedges) {
            if (hyperedge.isFusionBridge) continue;
            for (let node of hyperedge.nodes) {
                node = this.masqueradeNode(node);
                utils.setIndex(bridgeIndex, node.symbol, node);
            }
        }

        for (let bridgeNodes of bridgeIndex.values()) {
            if (bridgeNodes.size < 2) continue;
            const bridgeNode = new BridgeNode(Array.from(bridgeNodes.values()));
            bridgeNode.updateGraphData(nodes, links);
        }

    }

    export() {
        const hyperedges = this.hyperedges.map(hyperedge => hyperedge.symbols);
        return csv.unparse(hyperedges, { header: false });
    }
}

Hypergraph.Hyperedge = Hyperedge;
Hypergraph.Node = Node;
Hypergraph.BridgeNode = BridgeNode;
Hypergraph.trackUUID = utils.trackUUID;