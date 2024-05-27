import { contextBridge, ipcRenderer } from "electron";
import Client from "@lib/Client";

// import { stream } from "./stream.js";
// ipcRenderer.stream = stream;


const client = new Client();
client.handler = ipcRenderer.invoke;

try {
    contextBridge.exposeInMainWorld("api", client.api);
} catch (error) {
    console.error(error);
}

/*
const api = {
    "edition": "electron",
    "isWeb": false,
    "isElectron": true,
    "uuid": {
        get: () => {
            return ipcRenderer.invoke("uuid.get");
        },
        set: (uuid) => {
            return ipcRenderer.invoke("uuid.set", uuid);
        }
    },
    analytics: {
        track: (event) => {
            return ipcRenderer.invoke("analytics.track", event);
        },
    },
    hypergraph: {
        isValid: () => {
            return ipcRenderer.invoke("hypergraph.isValid");
        },
        graphData: (filter = [], options = null) => {
            return ipcRenderer.invoke("hypergraph.graphData", filter, options);
        },
        create: () => {
            return ipcRenderer.invoke("hypergraph.create");
        },
        export: () => {
            return ipcRenderer.invoke("hypergraph.export");
        },
        explain: async (input, options = {}) => {
            return ipcRenderer.stream("hypergraph.explain", input, options);
        },
    },
    hyperedges: {
        add: (hyperedge, symbol) => {
            return ipcRenderer.invoke("hyperedges.add", hyperedge, symbol);
        },
        remove: (hyperedge) => {
            return ipcRenderer.invoke("hyperedges.remove", hyperedge);
        },
        all: () => {
            return ipcRenderer.invoke("hyperedges.all");
        },
        generate: async (input, options = {}) => {
            return ipcRenderer.stream("hyperedges.generate", input, options);
        },
        "export": () => {
            return ipcRenderer.invoke("hyperedges.export",);
        },
        "wormhole": (input, options) => {
            return ipcRenderer.invoke("hyperedges.wormhole", input, options);
        }
    },
    license: {
        validate: (license) => {
            return ipcRenderer.invoke("license.validate", license);
        },
        info: () => {
            return ipcRenderer.invoke("license.info");
        },
    },
    messages: {
        receive: (channel, func) => {
            return subscribe(func, channel);
        },
    },
    chat: (messages, options = {}) => {
        return ipcRenderer.stream("chat", messages, options);
    },
    settings: {
        get: (key) => {
            return ipcRenderer.invoke("settings.get", key);
        },
        set: (key, value) => {
            return ipcRenderer.invoke("settings.set", key, value);
        },
    },
    convert: {
        webmToMp4: (buffer) => {
            return ipcRenderer.invoke("convert.webmToMp4", buffer);
        }
    },
};
*/
