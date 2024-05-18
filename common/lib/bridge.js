import LLM from "@themaximalist/llm.js"
import ThinkableType from "@themaximalist/thinkabletype";

import colors from "./colors.js";
import { isUUID, isEmptyUUID, generate as generateUUID } from "./uuid.js";
import License from "./License.js";
// import Analytics from "./Analytics.js";
import extractor from "./extractor.js";
import { webmToMp4, base64ToBuffer } from "./ffmpeg.js";

import * as GoogleSearch from "./GoogleSearch.js";

export default class Bridge {
    constructor(thinkabletype = null, guid = null, uuid = null) {
        this.thinkabletype = thinkabletype || new ThinkableType({ colors });
        this.guid = guid;
        this.uuid = uuid;
        this.send = function () { throw new Error("send not implemented") }
        this.save = function () { throw new Error("save not implemented") }
        this.log = function (msg) { console.log(msg) }
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
        this.log(`Analytics: ${event}`);
        // Analytics.track(event)
    }

    getUUID() {
        return this.uuid
    }

    setUUID(uuid) {
        this.uuid = uuid
    }

    exportHypergraph() {
        return this.thinkabletype.export();
    }

    isValidHypergraph() {
        if (!this.uuid) return false;
        if (!isUUID(this.uuid)) return false;
        if (isEmptyUUID(this.uuid)) return false;
        return true;
    }

    addHyperedges(hyperedge, symbol, interwingle) {
        console.log("ADD HYPEREDGE", hyperedge, symbol, interwingle)
        this.thinkabletype.interwingle = interwingle;

        let edge = this.thinkabletype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = this.thinkabletype.add(...hyperedge, symbol);
        }

        this.trackAnalytics("hyperedges.add");

        console.log("INTERWINGLE", this.thinkabletype.interwingle);
        console.log("ADDED EDGE", edge.id);

        return edge.id;
    }

    removeHyperedges(hyperedge) {
        this.trackAnalytics("hyperedges.remove");
        this.thinkabletype.remove(...hyperedge);
    }

    async generateHyperedges(input, options) {
        this.trackAnalytics("hyperedges.generate");

        if (input.startsWith("http://") || input.startsWith("https://")) {
            this.send({ event: "success", message: "Scraping URL..." });
            try {
                const data = await extractor(input);
                this.send({ event: "success", message: "Scraped URL!" });
                input = data;
            } catch (e) {
                const message = e.message || e;
                this.log(`Error scraping URL ${input}: ${message}`);
                this.send({ event: "error", message: "Couldn't scrape URL" });
                throw e;
            }
        }

        this.send({ event: "hyperedges.generate.start" });

        if (options.llm) {
            if (!this.thinkabletype.options.llm) { this.thinkabletype.options.llm = {} }
            if (options.llm.service) { this.thinkabletype.options.llm.service = options.llm.service }
            if (options.llm.model) { this.thinkabletype.options.llm.model = options.llm.model }
            if (options.llm.apikey) { this.thinkabletype.options.llm.apikey = options.llm.apikey }
        }

        try {
            const response = await this.thinkabletype.generate(input, options);

            let generated = false;
            for await (const hyperedges of response) {
                generated = true;
                this.thinkabletype.addHyperedges(hyperedges);
                for (const hyperedge of hyperedges) {
                    this.send({ event: "hyperedges.generate.result", hyperedge });
                }

                this.save();
            }

            if (generated) {
                this.send({ event: "success", message: "Generated knowledge graph" });
            }

        } catch (e) {
            const message = e.message || e;
            this.log(`Error generating knowledge graph: ${message}`);
            this.send({ event: "hyperedges.error", message: `Error generating knowledge graph: ${message}` });
        } finally {
            this.send({ event: "hyperedges.generate.stop" });
        }
    }

    async generateWormhole(input, options = {}) {
        this.trackAnalytics("hyperedges.wormhole");

        if (options.llm) {
            if (!this.thinkabletype.options.llm) { this.thinkabletype.options.llm = {} }
            if (options.llm.service) { this.thinkabletype.options.llm.service = options.llm.service }
            if (options.llm.model) { this.thinkabletype.options.llm.model = options.llm.model }
            if (options.llm.apikey) { this.thinkabletype.options.llm.apikey = options.llm.apikey }
        }

        const response = await this.thinkabletype.generate(input, options);

        for await (const hyperedges of response) {
            this.thinkabletype.addHyperedges(hyperedges);
        }
    }

    async chat(msgs, opts = {}) {

        const options = { stream: true };
        if (opts.llm) {
            if (opts.llm.service) { options.service = opts.llm.service }
            if (opts.llm.model) { options.model = opts.llm.model }
            if (opts.llm.apikey) { options.apikey = opts.llm.apikey }
        }

        const messages = msgs.map((msg) => {
            return { role: msg.role, content: msg.content }
        });

        try {
            const response = await LLM(messages, options);
            for await (const data of response) {
                this.send({ event: "chat.message", data });
            }

            this.send({ event: "chat.stop" });
        } catch (e) {
            const message = e.message || e;
            this.log(`Error in chat: ${message}`);
            this.send({ event: "chat.error", message: `Error in chat: ${message}` });
            throw e;
        }
    }

    async explain(input, options) {
        this.trackAnalytics("hyperedges.explain");

        this.send({ event: "hyperedges.explain.start" });

        // TODO: simplify this
        if (options.llm) {
            if (!this.thinkabletype.options.llm) { this.thinkabletype.options.llm = {} }
            if (options.llm.service) { this.thinkabletype.options.llm.service = options.llm.service }
            if (options.llm.model) { this.thinkabletype.options.llm.model = options.llm.model }
            if (options.llm.apikey) { this.thinkabletype.options.llm.apikey = options.llm.apikey }
        }

        try {
            const response = await this.thinkabletype.explain(input, options);

            for await (const chunk of response) {
                this.send({ event: "hyperedges.explain.chunk", chunk });
            }

        } catch (e) {
            const message = e.message || e;
            this.log(`Error explaining knowledge graph: ${message}`);
            this.send({ event: "hyperedges.error", message: `Error explaining knowledge graph: ${message}` });
        } finally {
            this.send({ event: "hyperedges.explain.stop" });
        }
    }

    async mediaSearch(input) {
        this.trackAnalytics("media.search");

        const searchId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        if (!searchId) {
            throw new Error("Missing GOOGLE_SEARCH_ENGINE_ID");
        }

        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        if (!apiKey) {
            throw new Error("Missing GOOGLE_SEARCH_API_KEY");
        }

        return await GoogleSearch.getTopImages(input, searchId, apiKey);
    }


    async createHypergraph() {
        this.uuid = generateUUID();
        this.thinkabletype = new ThinkableType({ colors });
        return this.uuid;
    }

    async webmToMp4(encoded) {
        try {
            const buffer = await base64ToBuffer(encoded);
            const mp4 = await webmToMp4(buffer);
            if (!mp4) throw new Error("No mp4 buffer");
            return Buffer.from(mp4).toString("base64");
        } catch (e) {
            const message = e.message || e;
            this.log(`Error in webToMp4: ${message}`);
            return null;
        }
    }

    async validateLicense(license) {
        return await License.check(license);
    }

    async renameNode(nodeId, name, interwingle) {
        this.thinkabletype.interwingle = interwingle;
        return this.thinkabletype.rename(nodeId, name);
    }
}