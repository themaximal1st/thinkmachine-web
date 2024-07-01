import { fastUUID } from './utils';

export default class BridgeNode {
    constructor(nodes) {
        this.nodes = nodes;
        this.uuid = fastUUID();
        this.bridge = true;
    }

    get symbol() {
        return this.nodes[0].symbol;
    }

    get color() {
        return this.nodes[0].color;
    }

    get uid() {
        return this.uuid;
    }

    get id() {
        return `${this.symbol}#bridge`;
    }

    get hyperedges() {
        return this.nodes.map(node => node.hyperedge);
    }

    get index() {
        return -1;
    }

    get masqueradeNode() {
        return false;
    }

}

