import * as utils from "@lib/utils";

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
export function zoomPadding(numSymbols, graphType = "3d") {
    if (graphType === "3d") {
        if (numSymbols >= 200) {
            return -550;
        } else if (numSymbols >= 100) {
            return -400;
        } else if (numSymbols >= 50) {
            return -200;
        } else if (numSymbols >= 20) {
            return -100;
        } else if (numSymbols >= 10) {
            return 50;
        } else if (numSymbols >= 3) {
            return 175;
        } else if (numSymbols === 1) {
            return 400;
        }
    } else {
        return 100;
    }
}

export async function zoom(app, oldData = null) {

    const timing = 200;

    const graphType = app.state.graphType;

    const padding = zoomPadding(app.uniqueSymbols.length, graphType);

    const nodes = nodeChanges(app.state.data, oldData || app.state.data);
    const nodeIndex = createIndex(nodes);

    // 3d is ok to focus on nodes, but in 2d it zooms too much
    if (graphType === "2d") {
        // console.log("2d zoom");
        app.graphRef.current.zoomToFit(timing, 100);
    } else {
        // console.log("3d zoom");
        app.graphRef.current.zoomToFit(timing, padding, (node) => {
            if (nodes.length === 0) return true;
            if (nodeIndex.has(node.id)) {
                return true;
            }
            return false;
        });
    }

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

// works in 2D, doesn't work in 3D. might be useful in the future.
export function hasNodesOff2DScreen(app) {

    const { x, y } = app.graphRef.current.getGraphBbox();

    let coordinate = app.graphRef.current.graph2ScreenCoords(
        x[0],
        y[0]
    );


    if (coordinate.x < 0) { return true }
    if (coordinate.y < 0) { return true }

    const width = window.innerWidth;
    const height = window.innerHeight;
    coordinate = app.graphRef.current.graph2ScreenCoords(
        x[1],
        y[1]
    );

    if (coordinate.x > width) { return true }
    if (coordinate.y > height) { return true }

    return false;
}

export function cameraPositionStable(lastCameraPosition, currentCameraPosition) {
    if (!lastCameraPosition || !currentCameraPosition) return false;
    return (
        lastCameraPosition.x === currentCameraPosition.x &&
        lastCameraPosition.y === currentCameraPosition.y &&
        lastCameraPosition.z === currentCameraPosition.z
    );
}

export function CameraPosition2D(app) {
    const centerAt = app.graphRef.current.centerAt();
    const zoom = app.graphRef.current.zoom();
    return { x: centerAt.x, y: centerAt.y, z: zoom };
}

function getCameraPosition(app) {
    if (app.state.graphType === "3d") {
        return app.graphRef.current.cameraPosition();
    }

    return CameraPosition2D(app);
}

// smartZoom knows if the user has zoomed/moved/panned the camera
// we only zoom explicitly or if the camera hasn't changed
export function smartZoom(app, oldData, shouldZoom = false) {

    return new Promise(async (resolve) => {
        let newCamera = getCameraPosition(app);
        let oldCamera = app.state.cameraPosition;

        // user hasn't moved camera
        if (cameraPositionStable(newCamera, oldCamera)) {
            shouldZoom = true;
        }

        if (!oldCamera || shouldZoom) {
            await utils.delay(200);
            await zoom(app, oldData);

            let interval = null;

            let i = 0;
            interval = setInterval(async () => {
                let currCamera = getCameraPosition(app);

                // stable
                if (cameraPositionStable(newCamera, currCamera)) {
                    clearInterval(interval);
                    return resolve(currCamera);
                } else {
                    newCamera = currCamera;
                }

                if (++i > 50) {
                    console.log("ERROR FINDING STABLE CAMERA");
                    clearInterval(interval);
                    return resolve(null);
                }
            }, 100);
        }
    });

}
