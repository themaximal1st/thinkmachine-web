import { contextBridge, ipcRenderer } from "electron";
import { stream } from "./stream.js";

ipcRenderer.stream = stream;

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
        }
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
    licenses: {
        validate: (license) => {
            return ipcRenderer.invoke("licenses.validate", license);
        },
        info: () => {
            return ipcRenderer.invoke("licenses.info");
        },
    },
    messages: {
        receive: (channel, func) => {
            return subscribe(func, channel);
        },
    },
    chat: (messages, options = {}) => {
        return ipcRenderer.stream("chat", messages, options);
    }
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
