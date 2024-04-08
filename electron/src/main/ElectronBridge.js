import { ipcMain } from "electron";

import Bridge from "@lib/bridge"

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

    async load() {
        const mapping = {
            "hypergraph.create": "createHypergraph",
            "hypergraph.isValid": "isValidHypergraph",
            "hypergraph.graphData": "graphData",
            "analytics.track": "trackAnalytics",
            "uuid.get": "getUUID",
            "uuid.set": "setUUID",
            "hyperedges.all": "allHyperedges",
            "hyperedges.add": "addHyperedges",
            "hyperedges.remove": "removeHyperedges",
        };

        for (const [event, method] of Object.entries(mapping)) {
            this.handle(event, this.bridge[method].bind(this.bridge));
        }
    }
}

/*
import * as settings from "./settings";
import License from "./License.js";

import * as services from "@services/index.js";

export default class ElectronBridge {
    constructor(thinkabletype, thinkmachine) {
        this.thinkabletype = thinkabletype;
        this.thinkmachine = thinkmachine;
        this.uuid = null;

        ipcMain.handle(
            "hyperedges.generate",
            this.generateHyperedges.bind(this)
        );
        ipcMain.handle("settings.get", this.getSetting.bind(this));
        ipcMain.handle("settings.set", this.setSetting.bind(this));
        ipcMain.handle("licenses.info", this.licenseInfo.bind(this));
        ipcMain.handle("licenses.validate", this.validateLicense.bind(this));
    }



    send(message, object = null) {
        this.thinkmachine.browserWindow.webContents.send(
            "message-from-main",
            message,
            object
        );
    }


    getSetting(_, key) {
        return settings.get(key);
    }

    setSetting(_, key, value) {
        return settings.set(key, value);
    }

    async validateLicense(_, license) {
        return await License.check(license);
    }

    async licenseInfo() {
        const info = {};
        if (License.license) {
            info.licenseKey = License.license;
        }

        info.trialExpired = License.trialExpired;
        info.trialRemaining = License.trialDurationRemaining;

        return info;
    }

    static async load(thinkabletype, thinkmachine) {
        return new Bridge(thinkabletype, thinkmachine);
    }
}

*/