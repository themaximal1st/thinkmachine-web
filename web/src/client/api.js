import { getCookie } from "@lib/cookies.js";
import { isUUID } from "@lib/uuid.js";

export default class ThinkMachineAPI {
    BASE_API_URL = "http://localhost:3000/api";

    constructor(uuid, options = {}) {
        this.options = options;

        this.uuid = uuid;
        if (!this.uuid) throw new Error("missing uuid");

        this.base_url = options.base_url || import.meta.env.VITE_API_URL || ThinkMachineAPI.BASE_API_URL;
        this.timeout = options.timeout || 10000;
    }

    get isValid() {
        if (!this.uuid) return false;
        if (this.uuid === ThinkMachineAPI.EMPTY_UUID) return false;
        if (!isUUID(this.uuid)) return false;
        return true;
    }

    async send(path, options = {}) {
        const controller = new AbortController()

        options.uuid = this.uuid;

        let response;
        const url = `${this.base_url}/${path}`;

        setTimeout(() => controller.abort(), this.timeout)
        response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            credentials: "include",
            body: JSON.stringify(options),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        try {
            const data = await response.json();
            if (!data.ok) throw new Error(`invalid response`);
            if (data.error) throw new Error(data.error);
            return data.data;
        } catch (e) {
            console.log(e);
            throw new Error(`JSON error! ${e.message}`)
        }
    }

    async stream(path, options = null) {
        options.uuid = this.uuid;
        const url = `${this.base_url}/${path}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(options),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async graphData(filter = [], options = {}) {
        if (!this.isValid) return { nodes: [], links: [] };

        return await this.send("hypergraph/graphData", {
            filter,
            options
        });
    }

    async allHyperedges() {
        if (!this.isValid) return [];
        return await this.send("hyperedges/all");
    }

    async createUser() {
        return await this.send("user/create");
    }

    async createHypergraph() {
        return await this.send("hypergraph/create");
    }

    async addHyperedge(hyperedge, symbol) {
        if (!this.isValid) return;
        return await this.send("hyperedges/add", { hyperedge, symbol });
    }

    async removeHyperedge(hyperedge) {
        if (!this.isValid) return;
        return await this.send("hyperedges/remove", { hyperedge });
    }

    async exportHypergraph() {
        return await this.send("hypergraph/export");
    }

    async getUser() {
        return getCookie("guid") || null;
    }

    async getOrCreateUser() {
        let user = await this.getUser();
        if (!user) {
            console.log("no user...creating");
            user = await this.createUser();
        }
        return user;
    }

    async generateWormhole(hyperedges, options) {
        if (!this.isValid) return;
        this.timeout = this.timeout * 4;
        await this.send("hyperedges/wormhole", { hyperedges, ...options });
        this.timeout = this.options.timeout || 10000;
    }

    async *generateHyperedges(input, options) {
        if (!this.isValid) return;
        const response = await this.stream("hyperedges/generate", { input, ...options });
        for await (const message of ThinkMachineAPI.readChunks(response.body.getReader())) {
            yield message;
        }
    }

    async *chat(messages, options) {
        if (!this.isValid) return;
        const response = await this.stream("chat", { messages, ...options });
        for await (const message of ThinkMachineAPI.readChunks(response.body.getReader())) {
            yield message;
        }
    }

    async *explain(input, options) {
        if (!this.isValid) return;
        const response = await this.stream("hypergraph/explain", { input, ...options });
        for await (const message of ThinkMachineAPI.readChunks(response.body.getReader())) {
            yield message;
        }
    }

    async track(event, properties = {}) {
        if (!this.isValid) return;
        return await this.send("analytics/track", { event, properties });
    }

    static UUID() {
        const url = new URL(window.location.href);
        const uuid = url.pathname.substring(1);
        if (!isUUID(uuid)) return null;

        return uuid;
    }

    async webmToMp4(buffer) {
        this.timeout = 10 * 60 * 1000;
        const response = await this.send("convert/webmToMp4", { buffer });
        this.timeout = this.options.timeout || 10000;
        return response;
    }

    async mediaSearch(input) {
        if (!this.isValid) return;
        return await this.send("media/search", { input });
    }

    async validateLicense(license) {
        return await this.send("license/validate", { license });
    }

    setupBridge(app) {
        if (window.api && !window.api.preloaded) { return }

        window.api = {
            "edition": "web",
            isWeb: true,
            isElectron: false,
            chat: this.chat.bind(this),
            "uuid": {
                get: async () => this.uuid,
                set: async (uuid) => this.uuid = uuid,
            },
            analytics: {
                track: this.track.bind(this),
            },
            hyperedges: {
                add: this.addHyperedge.bind(this),
                remove: this.removeHyperedge.bind(this),
                all: this.allHyperedges.bind(this),
                generate: this.generateHyperedges.bind(this),
                wormhole: this.generateWormhole.bind(this),
            },
            hypergraph: {
                graphData: this.graphData.bind(this),
                explain: this.explain.bind(this),
                export: this.exportHypergraph.bind(this),
                create: async () => {
                    this.uuid = await this.createHypergraph();
                    return this.uuid;
                },
                isValid: async () => this.isValid,
                search: app.searchText.bind(app),
            },
            media: {
                search: this.mediaSearch.bind(this),
                screenshot: app.takeScreenshot.bind(app),
                recordVideo: app.recordVideo.bind(app),
            },
            convert: {
                webmToMp4: this.webmToMp4.bind(this),
            },
            license: {
                validate: this.validateLicense.bind(this),
            },
            node: {
                activateSlug: app.activateSlug.bind(app),
                toggleEdit: app.toggleEditNode.bind(app),
                toggleActiveNodeImages: app.toggleActiveNodeImages.bind(app),
                hover: app.hoverNode.bind(app),
                leave: app.leaveNode.bind(app),
            },
        }
    }

    static async load(app) {
        console.log("LOADING");
        let uuid = ThinkMachineAPI.UUID();
        if (!uuid) {
            console.log("NO UUID");
            uuid = ThinkMachineAPI.EMPTY_UUID;
        }

        const api = new ThinkMachineAPI(uuid);
        await api.getOrCreateUser();
        api.setupBridge(app);


        return api;
    }

    static readChunks(reader) {
        const decoder = new TextDecoder("utf-8");
        return {
            async *[Symbol.asyncIterator]() {
                let readResult = await reader.read();
                while (!readResult.done) {
                    const value = decoder.decode(readResult.value);
                    const lines = value.trim().split(/\n+/);
                    for (const line of lines) {
                        const json = JSON.parse(line.split("data: ")[1]);
                        yield json;
                    }
                    readResult = await reader.read();
                }
            },
        };
    }
}

ThinkMachineAPI.EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

window.api = {
    "edition": "web",
    isWeb: true,
    isElectron: false,
    preloaded: true,
};
