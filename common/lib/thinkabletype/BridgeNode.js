import { v4 as uuidv4 } from 'uuid';

export default class BridgeNode {
    constructor(nodes) {
        this.nodes = nodes;
        this.hypergraph = this.nodes[0].hypergraph;
        this.uuid = uuidv4();
        this.bridge = true;
    }

    get node() {
        return this.nodes[0];
    }

    get symbol() {
        return this.node.symbol;
    }

    get id() {
        return `${this.node.symbol}#bridge`;
    }

    get ids() {
        return this.hyperedges.map(edge => edge.id);
    }

    get nodeIDs() {
        return this.nodes.map(node => node.id);
    }

    get nodeUUIDs() {
        return this.nodes.map(node => node.uuid);
    }

    get hyperedges() {
        return Array.from(new Set(this.nodes.map(node => node.hyperedge)));
    }

    get index() {
        return -1;
    }

    get masqueradeNode() {
        return false;
    }

    updateGraphData(nodes, links) {
        nodes.set(this.id, {
            id: this.id,
            uuid: this.uuid,
            name: this.symbol,
            bridge: true,
            ids: this.ids,
            nodeIDs: this.nodeIDs,
            nodeUUIDs: this.nodeUUIDs,
        });

        for (const node of this.nodes) {
            const n = nodes.get(node.id);
            n.ids.add(this.id);
            const link = node.hyperedge.linkData(this, node);
            link.nodeIDs = this.nodeIDs;
            link.nodeUUIDs = this.nodeUUIDs;
            links.set(link.id, link);
        }
    }
}

