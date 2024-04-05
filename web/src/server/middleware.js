import * as uuidtools from "../common/lib/uuid.js";

import Bridge from "../common/lib/bridge.js";
import Event from "./models/event.js";
import HypergraphManager from "./managers/hypergraph.js";

export async function user(req, res, next) {
    if (!req.path.startsWith("/api")) return next();

    req.uuid = (req.method === "GET" ? req.query.uuid : req.body.uuid);
    req.guid = req.signedCookies.guid;
    req.ip_address = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    console.log(`[${req.ip_address}] ${req.method} ${req.path} ${req.guid} ${req.uuid ? req.uuid : ""}`);

    next();
}

export async function event(req, res, next) {
    if (!req.path.startsWith("/api")) return next();

    req.event = async (action, data = null) => {
        if (!req.guid) throw new Error("missing guid");
        if (uuidtools.isEmptyUUID(req.guid)) throw new Error("missing uuid")
        if (!req.ip_address) throw new Error("missing ip_address");
        if (typeof data !== "string") data = JSON.stringify(data);

        await Event.create({
            action,
            uuid: req.uuid,
            guid: req.guid,
            ip: req.ip_address,
            data,
        });
    };

    next();
}

export async function thinkmachine(req, res, next) {
    if (!req.path.startsWith("/api")) return next();

    if (!req.guid) {
        if (req.path === "/api/user/create") { return next() }
        return res.json({ ok: false, error: "invalid guid" });
    }

    if (!req.uuid || !uuidtools.isUUID(req.uuid) || uuidtools.isEmptyUUID(req.uuid)) {
        if (req.path === "/api/hypergraph/create") { return next() }
        return res.json({ ok: false, error: "invalid uuid" });
    }

    req.thinkabletype = await HypergraphManager.thinkableTypeForUUID(req.uuid);
    if (!req.thinkabletype) { return res.json({ ok: false, error: "invalid uuid" }) }

    next();
}

export async function bridge(req, res, next) {
    if (!req.path.startsWith("/api")) return next();
    if (!req.thinkabletype) return next();
    if (!req.guid) return next();

    req.bridge = new Bridge(req.thinkabletype, req.guid);

    next();
}