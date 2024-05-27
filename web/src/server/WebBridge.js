import API from "../common/lib/API.js"

export default class WebBridge {
    constructor(app) {
        this.app = app;
        this.api = new API();
    }

    static async initialize(app) {
        const bridge = new WebBridge(app);
        await bridge.load();
        return bridge;
    }

    async load() {
        for (const method of this.api.methods) {
            this.post(`/api/${method}`, async ({ req, res }) => {
                return this.api[method](...req.body.args);
            });
        }
    }

    post(route, handler, options = {}) {
        this.app.post(route, async (req, res) => {
            try {
                // const event = route;
                const data = await handler({ req, res });

                if (data && data.send) { return data }
                return res.json({ ok: true, data });
            } catch (e) {
                return res.json({ ok: false, error: e.message });
            }
        });
    }
}
/*
import { v4 as uuid } from "uuid";

import * as middleware from "./middleware.js"
import Hypergraph from "./models/hypergraph.js";
import HypergraphManager from "./managers/hypergraph.js";
import { isUUID } from "../common/lib/uuid.js";
// import Analytics from "./analytics.js";

export default class WebBridge {
    constructor(app) {
        this.app = app;
    }

    static async initialize(app) {
        const bridge = new WebBridge(app);
        await bridge.load();
        return bridge;
    }

    async load() {
        this.app.use(middleware.user);
        this.app.use(middleware.event);
        this.app.use(middleware.thinkmachine);
        this.app.use(middleware.bridge);

        this.post("/api/user/create", async ({ req, res }) => {
            let guid = req.signedCookies.guid;
            if (!guid) {
                guid = uuid();
                req.guid = guid;
                res.cookie("guid", guid, { signed: true, expires: new Date(Date.now() + 31536000000) });
            }

            return guid;
        });

        this.post("/api/hypergraph/graphData", ({ bridge, body }) => {
            return bridge.graphData(body.filter, body.options);
        });

        this.post("/api/hypergraph/create", async ({ req }) => {
            return await this.createHypergraph(req);
        }, { save: true });

        this.post("/api/hyperedges/all", ({ bridge }) => {
            return bridge.allHyperedges();
        });

        this.post("/api/hyperedges/add", ({ bridge, body }) => {
            return bridge.addHyperedges(body.hyperedge, body.symbol, body.interwingle);
        }, { save: true });

        this.post("/api/hyperedges/remove", ({ bridge, body }) => {
            return bridge.removeHyperedges(body.hyperedge);
        }, { save: true });

        this.post("/api/analytics/track", ({ body }) => {
            // Analytics.track(body.event, body.properties);
        });

        this.post("/api/hypergraph/export", ({ bridge }) => {
            return bridge.exportHypergraph();
        });

        this.post("/api/media/search", ({ bridge, body }) => {
            const { input } = body;
            return bridge.mediaSearch(input);
        });

        this.stream("/api/hyperedges/generate", async ({ bridge, body, res }) => {
            let { input, llm } = body;
            return await bridge.generateHyperedges(input, { llm });
        });

        this.stream("/api/chat", async ({ bridge, body, res }) => {
            let { messages, llm } = body;
            return await bridge.chat(messages, { llm });
        });

        this.stream("/api/hypergraph/explain", async ({ bridge, body, res }) => {
            let { input, llm } = body;
            return await bridge.explain(input, { llm });
        });

        this.post("/api/hyperedges/wormhole", async ({ bridge, body, req, res }) => {
            const { hyperedges, from_uuid, llm } = body;

            const symbols = await this.hyperedgesToSymbols(hyperedges, from_uuid);
            if (!symbols || symbols.length === 0) {
                return res.json({ ok: false, error: "missing input" });
            }

            const input = symbols.join("\n");

            await bridge.generateWormhole(input, { llm });
            await this.saveHypergraph(req);
        });

        this.post("/api/convert/webmToMp4", async ({ bridge, body }) => {
            return await bridge.webmToMp4(body.buffer);
        }, { save: false });

        this.post("/api/license/validate", async ({ bridge, body }) => {
            const { license } = body;
            return await bridge.validateLicense(license);
        }, { save: false });

        this.post("/api/node/rename", async ({ bridge, body }) => {
            const { nodeId, name, interwingle } = body;
            return await bridge.renameNode(nodeId, name, interwingle);
        }, { save: true });

        this.post("/api/node/remove", async ({ bridge, body }) => {
            const { nodeId, hyperedgeID, interwingle } = body;
            return await bridge.removeNode(nodeId, hyperedgeID, interwingle);
        }, { save: true });
    }

    async createHypergraph(req) {
        req.uuid = uuid();
        await Hypergraph.create({ id: req.uuid, guid: req.guid });
        req.thinkabletype = await HypergraphManager.thinkableTypeForUUID(req.uuid);
        return req.uuid;
    }

    async saveHypergraph(req) {
        const hypergraph = await Hypergraph.findByPk(req.uuid);
        hypergraph.data = req.thinkabletype.export();
        await hypergraph.save();
    }

    async hyperedgesToSymbols(hyperedges, uuid) {
        if (!hyperedges || !Array.isArray(hyperedges) || hyperedges.length === 0) { return [] }
        if (!uuid || !isUUID(uuid)) { return [] }

        const thinkmachine = await HypergraphManager.thinkableTypeForUUID(uuid);
        if (!thinkmachine) { return [] }

        const edges = new Set();
        for (const h of thinkmachine.hyperedges) {
            const id = h.id.replace(/^\d+:/, ""); // hack for interwingle state being lost
            if (hyperedges.includes(id)) {
                edges.add(h.symbols.join(" "));
            }
        }

        if (edges.size === 0) { return [] }

        return Array.from(edges);
    }

    async handle(config = {}) {
        if (!config.req) { throw new Error("missing req") }
        if (!config.res) { throw new Error("missing res") }
        if (!config.event) { throw new Error("missing event") }
        if (!config.handler) { throw new Error("missing handler") }
        if (!config.options) { config.options = {} }
        if (typeof config.options.save === "undefined") { config.options.save = false; }

        const { req, res, event, handler, options } = config;

        if (!req.uuid) { return res.json({ ok: false, error: "invalid uuid" }); }
        if (!req.guid) {
            if (!req.path.startsWith("/api/user/create")) {
                return res.json({ ok: false, error: "invalid guid" });
            }
        }

        const { bridge, body } = req;

        if (bridge && options.save) {
            bridge.save = () => { this.saveHypergraph(req) };
        }

        const opts = { req, res, bridge, body };

        let data;
        try {
            if (handler.constructor.name === "AsyncFunction") {
                data = await handler(opts);
            } else {
                data = handler(opts);
            }
        } catch (e) {
            return res.json({ ok: false, error: e.message });
        }

        if (options.save) {
            await this.saveHypergraph(req);
        }

        await req.event(event, JSON.stringify(req.body));

        return data;
    }

    post(route, handler, options = {}) {
        this.app.post(route, async (req, res) => {
            try {
                const event = route;
                const data = await this.handle({ req, res, event, handler, options });

                if (data && data.send) { return data }
                return res.json({ ok: true, data });
            } catch (e) {
                return res.json({ ok: false, error: e.message });
            }
        });
    }

    stream(route, handler, options = {}) {
        if (typeof options.save === "undefined") { options.save = true; }

        this.app.post(route, async (req, res) => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('X-Accel-Buffering', 'no');

            const bridge = req.bridge;
            bridge.send = (message) => { res.write("data: " + JSON.stringify(message) + "\n\n") }

            try {
                const event = route;
                await this.handle({ req, res, event, handler, options });
            } catch (e) {
                console.log("E", e);
                bridge.send({ event: "error", message: e.message });
            } finally {
                res.end();
            }
        });
    }
}
*/