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

    async generateHyperedges(input, options = {}) {
        this.trackAnalytics("hyperedges.generate");

        if (options.llm) {
            if (!this.thinkabletype.options.llm) { this.thinkabletype.options.llm = {} }
            if (options.llm.service) { this.thinkabletype.options.llm.service = options.llm.service }
            if (options.llm.model) { this.thinkabletype.options.llm.model = options.llm.model }
            if (options.llm.apikey) { this.thinkabletype.options.llm.apikey = options.llm.apikey }
        }

        try {
            console.log("FETCHING", input, options);

            this.send("hyperedges.generate.start");
            const response = await this.thinkabletype.generate(input, options);

            for await (const hyperedges of response) {
                this.thinkabletype.addHyperedges(hyperedges);
                for (const hyperedge of hyperedges) {
                    console.log("hyperedge", hyperedge);
                    this.send("hyperedges.generate.result", hyperedge);
                }
            }
        } catch (e) {
            console.log("ERROR", e);
            this.send("error", e.message);
        } finally {
            this.send("hyperedges.generate.stop");
        }
        // TODO: Stop Loading
    }

}