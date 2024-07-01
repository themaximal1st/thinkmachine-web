import { setIndex, addIndex, verifyGraphData, uniq, restoreData } from "./utils";
import BridgeNode from "./BridgeNode";
import FilterGraph from "./FilterGraph";

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
        let data = { nodes: new Map(), links: new Map() }

        this.updateIndexes();

        for (const hyperedge of this.schematic.hyperedges) {
            if (this.schematic.isFusion && hyperedge.isFusionBridge) {
                // hyperedge.updateIndexes(nodes, links);
            } else {
                this.updateLinkData(hyperedge, data);
            }
        }

        if (this.schematic.isFusion) {
            this.updateFusionData(data);
        }

        if (this.schematic.isBridge) {
            this.updateBridgeData(data);
        }

        if (lastData) {
            data = restoreData(data, lastData);
        }


        verifyGraphData(data);

        if (Array.isArray(filter) && filter.length > 0) {
            return FilterGraph({
                data,
                filter,
                schematic: this.schematic,
            });
        }

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

    updateLinkData(hyperedge, data) {
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
        const hyperedges = [node.hyperedge];
        node = this.masqueradeNode(node);
        nodes.push(node);
        hyperedges.push(node.hyperedge);
        // const indexes = this.updateIndexes(nodes, links);


        data.nodes.set(node.id, {
            id: node.id,
            uid: node.uid,
            uuid: node.uuid,
            name: node.symbol,
            color: node.hyperedge.color,
            nodes: uniq(nodes),
            hyperedges: uniq(hyperedges),
            // ...indexes
        });
    }

    // TODO: Figure this out
    updateNodeIndexes(node, data) {
        node = this.masqueradeNode(node);
        const existing = data.nodes.get(node.id);
    }

    // updateIndexes(nodes) {
    //     const node = this.hypergraph.masqueradeNode(this);

    //     const existing = nodes.get(node.id);

    //     const edgeIDs = existing ? existing.edgeIDs : new Set();
    //     edgeIDs.add(this.hyperedge.id);
    //     edgeIDs.add(node.hyperedge.id);

    //     const edgeUUIDs = existing ? existing.edgeUUIDs : new Set();
    //     edgeUUIDs.add(this.hyperedge.uuid);
    //     edgeUUIDs.add(node.hyperedge.uuid);

    //     const nodeIDs = existing ? existing.nodeIDs : new Set();
    //     nodeIDs.add(this.id);
    //     nodeIDs.add(node.id);

    //     const nodeUUIDs = existing ? existing.nodeUUIDs : new Set();
    //     nodeUUIDs.add(this.uuid);
    //     nodeUUIDs.add(node.uuid);

    //     return {
    //         edgeIDs,
    //         edgeUUIDs,
    //         nodeIDs,
    //         nodeUUIDs,
    //     }
    // }

    linkData(parent, child) {
        const hyperedges = [];
        const nodes = [];

        function updateReferences(node) {
            nodes.push(node);

            if (node.bridge) {
                for (const edge of node.hyperedges) {
                    hyperedges.push(edge);
                }
            } else {
                hyperedges.push(node.hyperedge);
            }
        }

        updateReferences(parent);
        updateReferences(child);
        parent = this.masqueradeNode(parent);
        child = this.masqueradeNode(child);
        updateReferences(parent);
        updateReferences(child);

        const link = {
            id: `${parent.id}->${child.id}`,
            source: parent.id,
            target: child.id,
            hyperedges: uniq(hyperedges),
            nodes: uniq(nodes),
            color: parent.color,
        };

        if (parent.bridge || child.bridge) {
            link.bridge = true;
        }

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
                this.updateLinkData(hyperedge, data);
                continue;
            }

            // if one side of the connection doesn't exist, create it
            if (fromNodes.length === 0 && toNodes.length > 0) {
                this.updateNodeData(hyperedge.firstNode, data);
                fromNodes.push(hyperedge.firstNode);
            }

            if (fromNodes.length > 0 && toNodes.length === 0) {
                this.updateNodeData(hyperedge.lastNode, data);
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

    updateBridgeData(data) {
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
            this.updateBridgeNodeData(bridgeNode, data);
        }
    }

    updateBridgeNodeData(bridgeNode, data) {
        data.nodes.set(bridgeNode.id, {
            id: bridgeNode.id,
            uid: bridgeNode.uid,
            uuid: bridgeNode.uuid,
            name: bridgeNode.symbol,
            bridge: true,
            nodes: bridgeNode.nodes,
            hyperedges: bridgeNode.hyperedges,
        });

        for (const node of bridgeNode.nodes) {
            const n = data.nodes.get(node.id);
            n.nodes.push(bridgeNode);
            // const n = nodes.get(node.id);
            // n.nodeIDs.add(bridgeNode.id);
            // link.nodeIDs = bridgeNode.nodeIDs;
            // link.nodeUUIDs = bridgeNode.nodeUUIDs;
            // link.edgeIDs = bridgeNode.edgeIDs;
            // link.edgeUUIDs = bridgeNode.edgeUUIDs;
            const link = this.linkData(bridgeNode, node);
            data.links.set(link.id, link);
        }
    }

}