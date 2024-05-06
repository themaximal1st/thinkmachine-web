import { ipcMain } from "electron";
import log from "electron-log/main.js";


import Bridge from "@lib/bridge"
import License from "./License.js";
import * as settings from "./settings.js";

export default class ElectronBridge {
    constructor(app) {
        this.bridge = new Bridge();
        this.app = app;
    }

    get thinkabletype() {
        if (!this.bridge) return null;
        return this.bridge.thinkabletype;
    }

    handle(event, handler) {
        ipcMain.handle(event, (...args) => {
            args.shift();
            return handler(...args);
        });
    }

    send(event) {
        let channel = "message-from-main";
        if (event.event) {
            channel = event.event.split(".")[0];
        }

        this.app.browserWindow.webContents.send(channel, event);
    }

    save() {
        // saving happens automatically with electron right now because it's single document
    }

    async load() {
        const mapping = {
            "hypergraph.create": "createHypergraph",
            "hypergraph.isValid": "isValidHypergraph",
            "hypergraph.graphData": "graphData",
            "hypergraph.export": "exportHypergraph",
            "analytics.track": "trackAnalytics",
            "uuid.get": "getUUID",
            "uuid.set": "setUUID",
            "hyperedges.all": "allHyperedges",
            "hyperedges.add": "addHyperedges",
            "hyperedges.remove": "removeHyperedges",
            "hyperedges.generate": "generateHyperedges",
            "hyperedges.wormhole": "generateWormhole",
            "hypergraph.explain": "explain",
            "chat": "chat",
            "convert.webmToMp4": "webmToMp4",
        };


        this.bridge.send = this.send.bind(this);
        this.bridge.save = this.save.bind(this);
        this.bridge.log = log.info.bind(log);

        for (const [event, method] of Object.entries(mapping)) {
            try {
                this.handle(event, this.bridge[method].bind(this.bridge));
            } catch (e) {
                log.error(`error handling ${event}: ${e}`);
            }
        }

        this.handle("license.info", this.licenseInfo.bind(this));
        this.handle("license.validate", this.validateLicense.bind(this));
        this.handle("settings.get", this.getSetting.bind(this));
        this.handle("settings.set", this.setSetting.bind(this));
    }

    licenseInfo() {
        const info = {};
        if (License.license) {
            info.licenseKey = License.license;
        }

        info.trialExpired = License.trialExpired;
        info.trialRemaining = License.trialDurationRemaining;

        return info;
    }

    async validateLicense(license) {
        return await License.check(license);
    }

    getSetting(key) {
        return settings.get(key);
    }

    setSetting(key, value) {
        return settings.set(key, value);
    }

}