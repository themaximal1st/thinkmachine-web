// import Analytics from "./analytics.js"
import debug from "debug";
const log = debug("thinkmachine:server:bridge");

import Hypergraph from "./models/hypergraph.js"
import ThinkableType from "@themaximalist/thinkabletype";
import colors from "./colors.js";
import extractor from "./extractor.js";
import { v4 as uuid } from "uuid";
import Event from "./models/event.js";
import { isUUID, isEmptyUUID } from "./utils.js";

export default class Bridge {
    constructor(app) {
        this.app = app;
        this.app.use(async (req, res, next) => {
            if (!req.path.startsWith("/api")) return next();

            let uuid;
            if (req.method === "GET") {
                uuid = req.query.uuid;
            } else if (req.method === "POST") {
                uuid = req.body.uuid;
            }

            req.uuid = uuid;
            req.guid = req.signedCookies.guid;
            req.ip_address = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

            req.sendEvent = async (action, data = "") => {
                if (!req.guid) throw new Error("missing guid");
                if (isEmptyUUID(req.guid)) throw new Error("missing uuid")
                if (!req.ip_address) throw new Error("missing ip_address");

                await Event.create({
                    action,
                    uuid: req.uuid,
                    guid: req.guid,
                    ip: req.ip_address,
                    data,
                });
            };

            console.log(`[${req.ip_address}] ${req.method} ${req.path} ${req.guid} ${req.uuid ? req.uuid : ""}`);

            if (!req.guid) {
                if (req.path === "/api/user/create") {
                    return next();
                }

                return res.json({ ok: false, error: "invalid guid" });
            }

            if (!uuid || !isUUID(uuid) || isEmptyUUID(uuid)) {
                if (req.path === "/api/hypergraph/create") {
                    return next();
                }

                return res.json({ ok: false, error: "invalid uuid" });
            }


            req.thinkabletype = await Bridge.thinkableTypeForUUID(uuid);
            if (!req.thinkabletype) {
                return res.json({ ok: false, error: "invalid uuid" });
            }

            next();
        });

        this.app.post("/api/hypergraph/create", this.createHypergraph.bind(this));
        this.app.post("/api/forceGraph/graphData", this.graphData.bind(this));
        this.app.post("/api/hyperedges/all", this.allHyperedges.bind(this));
        this.app.post("/api/hyperedges/add", this.addHyperedges.bind(this));
        this.app.post("/api/hyperedges/remove", this.removeHyperedges.bind(this));
        this.app.post("/api/hyperedges/generate", this.generateHyperedges.bind(this));
        this.app.post("/api/hyperedges/export", this.exportHyperedges.bind(this));
        this.app.post("/api/hyperedges/wormhole", this.generateWormhole.bind(this));
        this.app.post("/api/user/create", this.createUser.bind(this));
        this.app.post("/api/analytics/track", this.trackAnalytics.bind(this));
    }

    trackAnalytics(req, res) {
        // const { event, properties } = req.body;
        // Analytics.track(event, properties);
        res.send({ ok: true });
    }

    async graphData(req, res) {
        let { interwingle, depth, filter } = req.body;

        if (typeof interwingle !== "undefined") {
            req.thinkabletype.interwingle = interwingle;
        }

        if (typeof depth !== "undefined") {
            req.thinkabletype.depth = depth;
        }

        if (!filter || !Array.isArray(filter)) {
            filter = [];
        }

        const data = req.thinkabletype.graphData(filter);

        await req.sendEvent("forceGraph.graphData", JSON.stringify({ interwingle, depth, filter }));

        return res.json({
            ok: true,
            data,
        });
    }

    async allHyperedges(req, res) {
        const data = req.thinkabletype.hyperedges.map((hyperedge) => hyperedge.symbols);

        await req.sendEvent("hyperedges.all");

        return res.json({
            ok: true,
            data,
        });
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

        const thinkmachine = await Bridge.thinkableTypeForUUID(from);
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
        const data = req.thinkabletype.export();

        await req.sendEvent("hyperedges.export");

        return res.json({
            ok: true,
            data,
        });
    }

    async createUser(req, res) {

        let guid = req.signedCookies.guid;
        if (!guid) {
            guid = uuid();

            req.guid = guid;

            res.cookie("guid", guid, {
                signed: true,
                expires: new Date(Date.now() + 900000),
            });

            await req.sendEvent("user.create");
        }

        return res.json({
            ok: true,
            data: guid,
        });
    }

    async createHypergraph(req, res) {
        req.uuid = uuid();

        await Hypergraph.create({
            id: req.uuid,
            guid: req.guid,
        });

        await req.sendEvent("hypergraph.create");

        return res.json({
            ok: true,
            data: req.uuid,
        });
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

        const thinkabletype = new ThinkableType({ colors });
        thinkabletype.parse(hypergraph.data);

        thinkabletype.save = async () => {
            const hypergraph = await Hypergraph.findByPk(uuid);
            hypergraph.data = thinkabletype.export();
            await hypergraph.save();
        };

        return thinkabletype;
    }

}