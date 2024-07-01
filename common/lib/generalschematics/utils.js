import sha256lib from "@lib/sha256"
import Colors from './colors.js';

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

export function verifyGraphData(data) {
    const nodeIDs = new Set(data.nodes.keys());

    for (const link of data.links.values()) {
        if (!nodeIDs.has(link.source)) {
            throw `Missing source ${link.source}`;
        } else if (!nodeIDs.has(link.target)) {
            throw `Missing target ${link.target}`;
        }
    }
}

// Force Graph expects the same exact object or it re-triggers a full update.... :(
export function restoreData(data, oldData) {
    const nodeUUIDIndex = createUUIDIndex(data.nodes.values());
    const idIndex = createIndex(oldData.nodes);
    const uidIndex = createUIDIndex(oldData.nodes);
    const updates = new Map();

    for (const node of data.nodes.values()) {
        const oldNode = uidIndex.get(node.uid) || idIndex.get(node.id);
        if (!oldNode) { continue }
        updates.set(node.id, oldNode);
    }

    for (const [id, oldNode] of updates) {
        const shadow = nodeUUIDIndex.get(oldNode.uuid);
        if (shadow) {
            for (const key of Object.keys(shadow)) { oldNode[key] = shadow[key] }
            oldNode["id"] = id;
        }

        data.nodes.set(id, oldNode);
    }


    return data;
}

export function sha256(str) {
    return sha256lib(str).hex();
}

export function findReferenceUUID(data, uuid) {
    // prefer bridges if they exist
    for (const node of data.nodes) {
        const nuuids = node.nodes.map(n => n.uuid);
        if (node.bridge && nuuids.includes(uuid)) {
            return node;
        }
    }

    for (const node of data.nodes) {
        const nuuids = node.nodes.map(n => n.uuid);
        if (nuuids.includes(uuid)) {
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


export function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ["#x20", " "],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (var i = 0, max = entities.length; i < max; ++i)
        text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);

    return text;
}

export function getInputOptions(input = "", options = {}) {
    if (typeof input === "object" && !Array.isArray(input) && Object.keys(options).length === 0) {
        options = input;
        input = "";

        if (options.hyperedges && Array.isArray(options.hyperedges)) {
            input = options.hyperedges;
            delete options.hyperedges;
        }
    }

    if (Array.isArray(input)) {
        input = input.map(hyperedge => hyperedge.join(" -> ")).join("\n");
    }

    if (typeof input !== "string") throw new Error("Input must be a string");

    options.interwingle = options.interwingle || 0;
    options.depth = options.depth || 0;
    options.colors = options.colors || Colors;

    return { input, options };
}

export function uniqAdd(array, value) {
    if (!array.includes(value)) {
        array.push(value);
    }
}

// return a unique array in same order
export function uniq(arr) {
    return [...new Set(arr)];
}

export function fixNodePosition(uuid, graphData) {
    for (const node of graphData.nodes) {
        if (node.uuid === uuid) {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;
        }
    }
}

export function unfixNodePosition(uuid, graphData) {
    for (const node of graphData.nodes) {
        if (node.uuid === uuid) {
            delete node.fx;
            delete node.fy;
            delete node.fz;
        }
    }
}

export function fastHash(arr) {
    let hash = 0;
    for (let i = 0; i < arr.length; i++) {
        const subArr = arr[i];
        for (let j = 0; j < subArr.length; j++) {
            const str = subArr[j];
            for (let k = 0; k < str.length; k++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(k);
                hash = hash & hash; // Convert to 32-bit integer
            }
        }
    }
    return hash >>> 0; // Convert to unsigned 32-bit integer
}


let uuid = 0;
export function fastUUID() {
    return "uuid-" + uuid++;
}
