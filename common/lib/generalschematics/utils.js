import Colors from "./colors.js";
import sha256lib from "@lib/sha256"

export function addIndex(index, key, val) {
    if (!index.has(key)) {
        index.set(key, []);
    }

    index.get(key).push(val);
}

export function setIndex(index, key, val) {
    if (!index.has(key)) {
        index.set(key, new Map());
    }

    index.get(key).set(val.id, val);
}

export function createIndex(items) {
    const index = new Map();
    for (const item of items) { index.set(item.id, item) }
    return index;
}

export function createUIDIndex(items) {
    const index = new Map();
    console.log("ITEMS", items);
    for (const item of items) { index.set(item.uid, item) }
    return index;
}

export function createUUIDIndex(items) {
    const index = new Map();
    for (const item of items) { index.set(item.uuid, item) }
    return index;
}

export function arrayContains(x, y) {
    if (y.length > x.length) {
        return false;
    }

    for (let i = 0; i <= x.length - y.length; i++) {
        let match = true;

        for (let j = 0; j < y.length; j++) {
            if (x[i + j].toLowerCase() !== y[j].toLowerCase()) {
                match = false;
                break;
            }
        }

        if (match) {
            return true;
        }
    }

    return false;
}

export function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i].toLowerCase() !== b[i].toLowerCase()) return false;
    }
    return true;
}

export function stringToColor(str, colors = Colors) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export function verifyGraphData(nodes, links) {
    const nodeIDs = new Set(nodes.keys());

    for (const link of links.values()) {
        if (!nodeIDs.has(link.source)) {
            throw `Missing source ${link.source}`;
        } else if (!nodeIDs.has(link.target)) {
            throw `Missing target ${link.target}`;
        }
    }
}

export function restoreData(data, oldData) {
    const uuidIndex = createUUIDIndex(oldData.nodes.values());
    const idIndex = createIndex(oldData.nodes.values());
    const uidIndex = createUIDIndex(oldData.nodes.values());
    const updates = new Map();

    for (const node of data.nodes.values()) {
        const oldNode = uidIndex.get(node.uid) || uuidIndex.get(node.uuid) || idIndex.get(node.id);
        if (!oldNode) continue;
        updates.set(node.id, oldNode);
    }

    for (const [id, node] of updates) {
        data.nodes.set(id, node);
    }

    return data;
}

export function sha256(str) {
    return sha256lib(str).hex();
}

export function findReferenceUUID(data, uuid) {
    // prefer bridges if they exist
    for (const node of data.nodes) {
        if (node.bridge && node.nodeUUIDs.has(uuid)) {
            return node;
        }
    }

    for (const node of data.nodes) {
        if (node.nodeUUIDs.has(uuid)) {
            return node;
        }
    }

    return null;
}

export function trackUUID(uuid, graphData) {
    if (!uuid) {
        return null;
    }

    for (let node of graphData.nodes) {
        if (node.uuid === uuid) {
            return node.uuid;
        }
    }

    const node = findReferenceUUID(graphData, uuid);

    if (!node) {
        return null;
    }

    return node.uuid;
}
