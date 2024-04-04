import ThinkableType from "@themaximalist/thinkabletype";
import colors from "./colors";
import { isUUID, isEmptyUUID } from "./uuid";
// import Analytics from "./Analytics.js";


export default class Bridge {
    constructor(thinkabletype = null) {
        this.thinkabletype = thinkabletype || new ThinkableType({ colors });
        this.uuid = null;
    }

    graphData(filter = [], options = {}) {
        if (typeof options.interwingle !== "undefined") { this.thinkabletype.interwingle = options.interwingle }
        if (typeof options.depth !== "undefined") { this.thinkabletype.depth = options.depth }
        return this.thinkabletype.graphData(filter, options);
    }

    allHyperedges() {
        return this.thinkabletype.hyperedges.map((hyperedge) => hyperedge.symbols);
    }

    trackAnalytics(event) {
        // TODO: implement
        console.log("ANALYTICS", event);
        // Analytics.track(event)
    }

    getUUID() {
        return this.uuid
    }

    setUUID(uuid) {
        this.uuid = uuid
    }

    isValidHypergraph(uuid) {
        if (!uuid) return false;
        if (!isUUID(uuid)) return false;
        if (isEmptyUUID(uuid)) return false;
        return true;
    }

    addHyperedges(hyperedge, symbol) {
        let edge = this.thinkabletype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = this.thinkabletype.add(...hyperedge, symbol);
        }

        this.trackAnalytics("hyperedges.add");

        return edge.id;
    }

    removeHyperedges(hyperedge) {
        this.trackAnalytics("hyperedges.remove");
        this.thinkabletype.remove(...hyperedge);
    }

}