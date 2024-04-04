import { ipcMain } from "electron";
import Analytics from "./Analytics.js";
import * as settings from "./settings";
import License from "./License.js";

export default class Bridge {
    constructor(thinkabletype, thinkmachine) {
        this.thinkabletype = thinkabletype;
        this.thinkmachine = thinkmachine;

        ipcMain.handle("analytics.track", this.trackAnalytics.bind(this));
        ipcMain.handle("forceGraph.graphData", this.graphData.bind(this));
        ipcMain.handle("hyperedges.add", this.addHyperedges.bind(this));
        ipcMain.handle("hyperedges.all", this.allHyperedges.bind(this));
        ipcMain.handle("hyperedges.remove", this.removeHyperedges.bind(this));
        ipcMain.handle(
            "hyperedges.generate",
            this.generateHyperedges.bind(this)
        );
        ipcMain.handle("settings.get", this.getSetting.bind(this));
        ipcMain.handle("settings.set", this.setSetting.bind(this));
        ipcMain.handle("licenses.info", this.licenseInfo.bind(this));
        ipcMain.handle("licenses.validate", this.validateLicense.bind(this));
    }

    trackAnalytics(_, event) {
        Analytics.track(event);
    }

    graphData(_, filter = [], options = {}) {
        if (typeof options.interwingle !== "undefined") {
            this.thinkabletype.interwingle = options.interwingle;
        }

        if (typeof options.depth !== "undefined") {
            this.thinkabletype.depth = options.depth;
        }

        return this.thinkabletype.graphData(filter);
    }

    addHyperedges(_, hyperedge, symbol) {
        let edge = this.thinkabletype.get(...hyperedge);
        if (edge) {
            edge.add(symbol);
        } else {
            edge = this.thinkabletype.add(...hyperedge, symbol);
        }

        Analytics.track("hyperedges.add");

        return edge.id;
    }

    allHyperedges() {
        const hyperedges = this.thinkabletype.hyperedges.map(
            (hyperedge) => hyperedge.symbols
        );
        return hyperedges;
    }

    removeHyperedges(_, hyperedge) {
        Analytics.track("hyperedges.remove");
        this.thinkabletype.remove(...hyperedge);
    }

    send(message, object = null) {
        this.thinkmachine.browserWindow.webContents.send(
            "message-from-main",
            message,
            object
        );
    }

    async generateHyperedges(_, input, options = {}) {
        Analytics.track("hyperedges.generate");

        if (options.llm) {
            if (!this.thinkabletype.options.llm) {
                this.thinkabletype.options.llm = {};
            }

            if (options.llm.service) {
                this.thinkabletype.options.llm.service = options.llm.service;
            }

            if (options.llm.model) {
                this.thinkabletype.options.llm.model = options.llm.model;
            }

            if (options.llm.apikey) {
                this.thinkabletype.options.llm.apikey = options.llm.apikey;
            }
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
