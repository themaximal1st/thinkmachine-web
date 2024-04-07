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

// restore node position from old node data to new node data
export function restoreNodePositions(oldData, newData) {
    const index = createIndex(oldData.nodes);
    for (const node of newData.nodes) {
        const old = index.get(node.id);
        if (!old) continue;
        if (typeof old.x === 'number') node.x = old.x;
        if (typeof old.y === 'number') node.y = old.y;
        if (typeof old.z === 'number') node.z = old.z;
        if (typeof old.vx === 'number') node.vx = old.vx;
        if (typeof old.vy === 'number') node.vy = old.vy;
        if (typeof old.vz === 'number') node.vz = old.vz;
    }

    return newData;
}

// TODO: This could probably be more sophisticated
export function zoomPadding(numSymbols) {
    let padding = 0;
    if (numSymbols === 1) {
        padding = 300;
    } else if (numSymbols < 3) {
        padding = 100;
    } else if (numSymbols < 10) {
        padding = 125;
    } else if (numSymbols < 20) {
        padding = 0;
    } else if (numSymbols < 50) {
        padding = 25;
    } else if (numSymbols < 100) {
        padding = -400;
    } else if (numSymbols < 200) {
        padding = -500;
    }

    padding = -550;
}

export async function zoom(app, oldData = null) {

    const delay = 250;
    const timing = 200;

    return new Promise((resolve) => {

        setTimeout(() => {
            const padding = zoomPadding(app.uniqueSymbols.length);

            const nodes = nodeChanges(app.state.data, oldData || app.state.data);
            const nodeIndex = createIndex(nodes);

            app.graphRef.current.zoomToFit(timing, padding, (node) => {
                if (nodes.length === 0) return true;
                if (nodeIndex.has(node.id)) {
                    console.log("Zooming to node", node.name);
                    return true;
                }
                return false;
            });

            resolve();
        }, delay);
    });
}


export function emitParticlesOnLinkChanges(app, oldData) {
    const links = linkChanges(app.state.data, oldData);
    for (const link of links) {
        app.graphRef.current.emitParticle(link);
    }
}

// we have this on thinkabletype, but a quick local version is fine
export function containsHyperedge(app, hyperedge) {
    const e1 = hyperedge.join(" ");
    for (const edge of app.state.hyperedges) {
        const e2 = edge.join(" ");
        if (e1 === e2) return true;
    }
    return false;
}