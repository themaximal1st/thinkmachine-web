import { contextBridge, ipcRenderer } from "electron";
import { EventIterator } from "event-iterator"

const validChannels = [
    "hyperedges",
    "chat",
];

// don't think this is how cleanup is supposed to be handled, but the only way I could figure it out
export function stream(channel) {
    let cleanup = null;

    const iterator = new EventIterator(
        ({ push }) => {
            if (!validChannels.includes(channel)) return null;

            const subscription = (event, ...args) => push(...args);
            ipcRenderer.on(channel, subscription);
            cleanup = () => {
                ipcRenderer.removeListener(channel, subscription);
            }

            return cleanup;
        }
    )

    return { iterator, cleanup };
}

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
            const { iterator, cleanup } = await stream("hyperedges");
            const response = ipcRenderer.invoke("hyperedges.generate", input, options);
            response.then(() => {
                cleanup();
            });
            return iterator;
        },
        "export": () => {
            return ipcRenderer.invoke("hyperedges.export",);
        },
        "wormhole": () => {
            return ipcRenderer.invoke("hyperedges.wormhole");
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
};

try {
    contextBridge.exposeInMainWorld("api", api);
} catch (error) {
    console.error(error);
}
