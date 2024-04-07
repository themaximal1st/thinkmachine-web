export function createIndex(items) {
    const index = new Map();
    for (const item of items) { index.set(item.id, item) }
    return index;
}

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

export async function zoom(app, delay = 250, timing = 200) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let numSymbols = app.uniqueSymbols.length;

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
                padding = -500;
            } else if (numSymbols < 200) {
                padding = -500;
            } else {
                padding = -550;
            }

            app.graphRef.current.zoomToFit(timing, padding);
            resolve();
        }, delay);
    });
}

export async function emitParticlesOnChanges(app, oldData) {
    const index = createIndex(oldData.links);
    for (const link of app.state.data.links) {
        if (!index.has(link.id)) {
            app.graphRef.current.emitParticle(link);
        }
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