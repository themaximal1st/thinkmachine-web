export function hexToRGBA(hex, alpha) {
    // Remove the hash at the beginning if it's there
    hex = hex.replace(/^#/, "");

    // Parse the hex color string
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Return the RGBA color string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// turn array into a map for quick indexing
export function createIndex(items) {
    const index = new Map();
    for (const item of items) { index.set(item.id, item) }
    return index;
}

// get the nodes that were added
export function nodeChanges(newData, oldData) {
    const index = createIndex(oldData.nodes);
    const nodes = [];

    for (const node of newData.nodes) {
        if (!index.has(node.id)) {
            nodes.push(node);
        }
    }

    return nodes;
}

// get the links that were added
export function linkChanges(newData, oldData) {
    const index = createIndex(oldData.links);
    const links = [];

    for (const link of newData.links) {
        if (!index.has(link.id)) {
            links.push(link);
        }
    }

    return links;
}

export function rollingIndex(index, length) {
    return (index + length) % length;
}

// cheap and easy way to find filter index for dupe check / remove
export function filterIndex(filter, filters = []) {
    for (let i = 0; i < filters.length; i++) {
        const f = filters[i];
        if (filter.node && filter.node === f.node) {
            return i;
        } else if (filter.edge && filter.edge === f.edge) {
            return i;
        } else if (JSON.stringify(filter) === JSON.stringify(f)) {
            return i;
        }
    }

    return -1;
}

export function saveFile(data, filename, type = "text/csv") {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
}