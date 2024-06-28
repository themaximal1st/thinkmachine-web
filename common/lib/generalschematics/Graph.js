import { setIndex, addIndex, verifyGraphData, uniq } from "./utils";

export default class Graph {
    constructor(schematic) {
        this.schematic = schematic;

        this.symbolIndex = new Map();
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();
        this.fusionIndex = new Map();
    }

    get tree() {
        return this.schematic.tree;
    }

    graphData(filter = null, lastData = null) {
        // let nodes = new Map();
        // let links = new Map();
        const data = { nodes: new Map(), links: new Map() }

        this.updateIndexes();

        for (const hyperedge of this.schematic.hyperedges) {
            if (this.schematic.isFusion && hyperedge.isFusionBridge) {
                // hyperedge.updateIndexes(nodes, links);
            } else {
                this.updateHyperedgeData(hyperedge, data);
            }
        }

        // if (lastData) {
        //     const data = restoreData({ nodes, links }, lastData);
        //     nodes = data.nodes;
        //     links = data.links;
        // }

        if (this.schematic.isFusion) {
            this.updateFusionData(data);
        }

        if (this.schematic.isBridge) {
            // this.updateBridgeData(nodes, links);
        }

        verifyGraphData(data);

        // if (Array.isArray(filter) && filter.length > 0) {
        //     return FilterGraph({
        //         filter,
        //         hyperedges: this.hyperedges,
        //         graphData: { nodes, links },
        //         depth: this.schematic.depth
        //     });
        // }

        return {
            nodes: Array.from(data.nodes.values()),
            links: Array.from(data.links.values()),
        };
    }

    updateIndexes() {
        this.symbolIndex = new Map();
        this.startSymbolIndex = new Map();
        this.endSymbolIndex = new Map();
        this.fusionIndex = new Map();

        for (const edge of this.schematic.hyperedges) {
            for (const node of edge.nodes) {
                addIndex(this.symbolIndex, node.symbol, node);
            }

            addIndex(this.startSymbolIndex, edge.firstNode.symbol, edge.firstNode);
            addIndex(this.endSymbolIndex, edge.lastNode.symbol, edge.lastNode);
        }

        if (!this.schematic.isFusion) { return }

        for (const edge of this.schematic.hyperedges) {
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

    updateHyperedgeData(hyperedge, data) {
        let parent = null;

        for (const node of hyperedge.nodes) {
            this.updateNodeData(node, data)

            if (parent) {
                const link = this.linkData(parent, node);
                data.links.set(link.id, link);
            }

            parent = node;
        }
    }

    updateNodeData(node, data) {
        const nodes = [node];
        node = this.masqueradeNode(node);
        nodes.push(node);
        // const indexes = this.updateIndexes(nodes, links);

        data.nodes.set(node.id, {
            id: node.id,
            uid: node.uid,
            uuid: node.uuid,
            name: node.symbol,
            color: node.hyperedge.color,
            nodes: uniq(nodes),
            // ...indexes
        });
    }

    linkData(parent, child) {
        // const edgeIDs = new Set();
        // const edgeUUIDs = new Set();

        // const nodeIDs = new Set();
        // const nodeUUIDs = new Set();

        // function updateIDs(node) {
        //     nodeIDs.add(node.id);
        //     nodeUUIDs.add(node.uuid);

        //     if (node.bridge) {
        //         for (const edge of node.hyperedges) {
        //             edgeIDs.add(edge.id);
        //             edgeUUIDs.add(edge.uuid);
        //         }
        //     } else {
        //         edgeIDs.add(node.hyperedge.id);
        //         edgeUUIDs.add(node.hyperedge.uuid);
        //     }
        // }

        // updateIDs(parent);
        // updateIDs(child);
        parent = this.masqueradeNode(parent);
        child = this.masqueradeNode(child);
        // updateIDs(parent);
        // updateIDs(child);

        const hyperedges = uniq([parent.hyperedge, child.hyperedge])

        const link = {
            id: `${parent.id}->${child.id}`,
            source: parent.id,
            target: child.id,
            hyperedges,
            // edgeIDs,
            // edgeUUIDs,
            // nodeIDs,
            // nodeUUIDs,
            color: parent.color,
        };

        // if (parent.bridge || child.bridge) {
        //     link.bridge = true;
        // }

        return link;
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

    fusionBridgeNodes(node) {
        const nodes = this.symbolIndex.get(node.symbol) || [];
        return nodes.filter(n => { return n.hyperedge.uuid !== node.hyperedge.uuid });
    }

    updateFusionData(data) {
        for (const hyperedge of this.schematic.hyperedges) {
            if (!hyperedge.isFusionBridge) continue;

            const fromNodes = this.fusionBridgeNodes(hyperedge.firstNode);
            const toNodes = this.fusionBridgeNodes(hyperedge.lastNode);

            // no connections...but ensure the edge exists
            if (fromNodes.length === 0 && toNodes.length === 0) {
                this.updateHyperedgeData(hyperedge, data);
                // hyperedge.updateIndexes(nodes, links);
                continue;
            }

            // if one side of the connection doesn't exist, create it
            if (fromNodes.length === 0 && toNodes.length > 0) {
                this.updateNodeData(hyperedge.firstNode, data);
                // hyperedge.firstNode.updateGraphData(nodes, links);
                fromNodes.push(hyperedge.firstNode);
            }

            if (fromNodes.length > 0 && toNodes.length === 0) {
                this.updateNodeData(hyperedge.lastNode, data);
                // hyperedge.lastNode.updateGraphData(nodes, links);
                toNodes.push(hyperedge.lastNode);
            }

            for (let fromNode of fromNodes) {
                fromNode = this.masqueradeNode(fromNode);

                for (let toNode of toNodes) {
                    toNode = this.masqueradeNode(toNode);

                    if (!data.nodes.has(fromNode.id)) { this.updateNodeData(fromNode, data) }
                    if (!data.nodes.has(toNode.id)) { this.updateNodeData(toNode, data) }

                    const linkData = this.linkData(fromNode, toNode);
                    data.links.set(linkData.id, linkData);
                }
            }

            // hyperedge.updateIndexes(nodes, links);
        }
    }

    _updateBridgeData(nodes, links) {
        const bridgeIndex = new Map();

        for (const hyperedge of this.schematic.hyperedges) {
            if (hyperedge.isFusionBridge) continue;
            for (let node of hyperedge.nodes) {
                node = this.masqueradeNode(node);
                setIndex(bridgeIndex, node.symbol, node);
            }
        }

        for (let bridgeNodes of bridgeIndex.values()) {
            if (bridgeNodes.size < 2) continue;
            const bridgeNode = new BridgeNode(Array.from(bridgeNodes.values()));
            bridgeNode.updateGraphData(nodes, links);
        }

    }
}