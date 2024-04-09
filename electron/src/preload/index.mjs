import { contextBridge, ipcRenderer } from "electron";
import { EventIterator } from "event-iterator"

const validChannels = [
    "hyperedges",
    "chat",
];

export function stream(event, input, options = {}) {
    const channel = event.split(".")[0];
    return new EventIterator(
        (queue) => {
            if (!validChannels.includes(channel)) return null;

            const subscription = (event, ...args) => queue.push(...args);
            ipcRenderer.on(channel, subscription);

            const response = ipcRenderer.invoke(event, input, options);
            response.catch(queue.fail);
            response.then(() => {
                // hack but messages can get caught in the queue
                setTimeout(() => {
                    queue.stop();
                }, 500);
            });

            return () => {
                ipcRenderer.removeListener(channel, subscription);
            }
        }
    )
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
            return stream("hyperedges.generate", input, options);
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
