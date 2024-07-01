import { v4 as uuidv4 } from 'uuid';

export default class BridgeNode {
    constructor(nodes) {
        this.nodes = nodes;
        this.uuid = uuidv4();
        this.bridge = true;
    }

    get symbol() {
        return this.nodes[0].symbol;
    }

    get color() {
        return this.nodes[0].color;
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

