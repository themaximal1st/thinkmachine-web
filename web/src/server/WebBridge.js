import { v4 as uuid } from "uuid";

import * as middleware from "./middleware.js"
import Hypergraph from "./models/hypergraph.js";
import HypergraphManager from "./managers/hypergraph.js";
// import Analytics from "./analytics.js";

export default class WebBridge {
    constructor(app) {
        this.app = app;
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

        let data;

        const opts = {
            req,
            res,
            body: req.body,
            bridge: req.bridge,
        };

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
            const data = await this.handle({
                req,
                res,
                event: route,
                handler,
                options
            });
            if (data && data.send) { return data }
            return res.json({ ok: true, data });
        });
    }

    stream(route, handler, options = {}) {
        if (typeof options.save === "undefined") { options.save = true; }

        this.app.post(route, async (req, res) => {
            res.sendMessage = function (message) { res.write("data: " + JSON.stringify(message) + "\n\n") }

            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('X-Accel-Buffering', 'no');

            await this.handle({
                req,
                res,
                event: route,
                handler,
                options
            });

            res.end();
        });
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

                res.cookie("guid", guid, {
                    signed: true,
                    expires: new Date(Date.now() + 900000),
                });

                await req.event("user.create");
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
            return bridge.addHyperedges(body.hyperedge, body.symbol);
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

        this.stream("/api/hyperedges/generate", async ({ bridge, body, req, res }) => {

            const { input, llm } = body;

            try {
                res.sendMessage({ event: "success", message: "Generating..." });

                res.sendMessage({ event: "hyperedges.generate.start" });

                const response = await bridge.generateHyperedges(input, llm);

                for await (const hyperedges of response) {
                    req.thinkabletype.addHyperedges(hyperedges);
                    await this.saveHypergraph(req);

                    for (const hyperedge of hyperedges) {
                        res.sendMessage({ event: "hyperedges.generate.result", hyperedge });
                    }
                }

                if (req.thinkabletype.hyperedges.length > 0) {
                    res.sendMessage({ event: "success", message: "Generated knowledge graph" });
                }
            } catch (e) {
                res.sendMessage({ event: "error", message: "Error while generating" });
            } finally {
                res.sendMessage({ event: "hyperedges.generate.stop" });
                res.end();
            }
        });


        // this.app.post("/api/hyperedges/wormhole", this.generateWormhole.bind(this));
        // this.app.post("/api/analytics/track", this.trackAnalytics.bind(this));
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

    static async initialize(app) {
        const bridge = new WebBridge(app);
        await bridge.load();
        return bridge;
    }
}

/*
// import Analytics from "./analytics.js"

import extractor from "./extractor.js";
import Event from "./models/event.js";
import { isUUID, isEmptyUUID } from "./utils.js";

export default class WebBridge {
    constructor(app) {
        this.app = app;
    }


    async addHyperedges(req, res) {
        const { hyperedge, symbol } = req.body;

        let edge = req.thinkabletype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = req.thinkabletype.add(...hyperedge, symbol);
        }

        await req.thinkabletype.save();

        await req.sendEvent("hyperedges.add", JSON.stringify({ hyperedge, symbol }));

        return res.json({
            ok: true,
            data: edge.id
        });
    }

    async removeHyperedges(req, res) {
        const { hyperedge } = req.body;
        // Analytics.track("hyperedges.remove");

        req.thinkabletype.remove(...hyperedge);
        await req.thinkabletype.save();

        await req.sendEvent("hyperedges.remove", JSON.stringify({ hyperedge }));

        return res.json({
            ok: true,
        });
    }

    async generateHyperedges(req, res) {
        // Analytics.track("hyperedges.generate");

        async function send(message) {
            res.write("data: " + JSON.stringify(message) + "\n\n");
        }

        let { input, llm } = req.body;
        if (!llm) {
            return res.json({ ok: false, error: "missing llm" });
        }


        const options = {
            service: llm.service,
            model: llm.model,
        };

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('X-Accel-Buffering', 'no');


        await send({ event: "hyperedges.generate.start" });

        if (input.startsWith("http")) {

            await send({ event: "success", message: "Scraping URL..." });

            try {
                const data = await extractor(input);
                await send({ event: "success", message: "Scraped URL!" });
                input = data;
            } catch (e) {
                console.log("ERROR", e);
                await send({ event: "error", message: "Couldn't scrape URL" });
                throw e;
            }
        }

        await req.sendEvent("hyperedges.generate", JSON.stringify({ input, options }));

        await send({ event: "success", message: "Generating..." });

        try {
            const response = await req.thinkabletype.generate(input, options);

            for await (const hyperedges of response) {
                req.thinkabletype.addHyperedges(hyperedges);
                await req.thinkabletype.save();

                for (const hyperedge of hyperedges) {
                    await send({ event: "hyperedges.generate.result", hyperedge });
                }
            }

            if (req.thinkabletype.hyperedges.length > 0) {
                await send({ event: "success", message: "Generated knowledge graph" });
            }

        } catch (e) {
            console.log("ERROR", e);
            await send({ event: "error", message: "Error while generating" });
        } finally {
            await send({ event: "hyperedges.generate.stop" });
        }
    }

    // TODO: migrate to shared service code
    async generateWormhole(req, res) {
        const { hyperedges, llm, from } = req.body;

        if (!llm) {
            return res.json({ ok: false, error: "missing llm" });
        }

        if (!hyperedges || !Array.isArray(hyperedges)) {
            return res.json({ ok: false, error: "missing hyperedges" });
        }

        if (!from || !isUUID(from)) {
            return res.json({ ok: false, error: "missing from" });
        }

        const thinkmachine = await WebBridge.thinkableTypeForUUID(from);
        if (!thinkmachine) {
            return res.json({ ok: false, error: "invalid from" });
        }

        const options = {
            service: llm.service,
            model: llm.model,
        };

        const edges = [];
        for (const h of thinkmachine.hyperedges) {
            const id = h.id.replace(/^\d+:/, "");
            if (hyperedges.includes(id)) {
                edges.push(h);
            }
        }

        const input = edges.map((edge) => edge.symbols.join(" ")).join("\n");

        if (!input || input.length === 0) {
            return res.json({ ok: false, error: "missing input" });
        }

        await req.sendEvent("hyperedges.wormhole", JSON.stringify({ input, options }));

        const response = await req.thinkabletype.generate(input, options);

        for await (const hyperedges of response) {
            req.thinkabletype.addHyperedges(hyperedges);
        }

        await req.thinkabletype.save();

        return res.json({
            ok: true,
            data: ""
        });
    }


    async exportHyperedges(req, res) {
    }


    static async thinkableTypeForUUID(uuid) {
        let hypergraph = await Hypergraph.findByPk(uuid);

        if (!hypergraph) {
            try {
                hypergraph = await Hypergraph.create({ id: uuid });
            } catch (e) {
                // race condition...try to fetch it again
                if (e.name === "SequelizeUniqueConstraintError") {
                    hypergraph = await Hypergraph.findByPk(uuid);
                }
            }
        }

        const thinkabletype = new ThinkableType({});
        thinkabletype.parse(hypergraph.data);

        thinkabletype.save = async () => {
            const hypergraph = await Hypergraph.findByPk(uuid);
            hypergraph.data = thinkabletype.export();
            await hypergraph.save();
        };

        return thinkabletype;
    }

}
*/