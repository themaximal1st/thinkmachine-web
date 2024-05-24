import * as utils from "@lib/utils";

class CameraPosition {
    constructor({ x, y, z }) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    equals(cameraPosition) {
        if (!cameraPosition) return false;
        return (
            this.x === cameraPosition.x &&
            this.y === cameraPosition.y &&
            this.z === cameraPosition.z
        );
    }
}

export default class Camera {
    constructor(props = {}) {
        this.props = props;
        this.lastPosition = null;
    }

    get graph() {
        return this.props.graphRef.current;
    }

    get is2D() { return this.props.graphType === "2d" }
    get is3D() { return this.props.graphType === "3d" }

    get position() {
        let cameraPosition;
        if (this.is2D) {
            const centerAt = this.graph.centerAt();
            const zoom = this.graph.zoom();
            cameraPosition = { x: centerAt.x, y: centerAt.y, z: zoom };
        } else {
            cameraPosition = this.graph.cameraPosition();
        }

        return new CameraPosition(cameraPosition);
    }

    get isStable() {
        return this.position.equals(this.lastPosition);
    }

    updateLastPosition() {
        this.lastPosition = this.position;
    }

    zoom(oldData = null, timing = 250) {
        if (this.is2D) {
            // 2d is weird..needs a longer delay before zoom to fit
            utils.delay(500).then(() => {
                this.graph.zoomToFit(timing, 100);
            });
            return;
        }

        const padding = zoomPadding(this.props.graphData.nodes.length, this.props.graphType);

        const nodes = utils.nodeChanges(this.props.graphData, oldData || this.props.graphData);
        const nodeIndex = utils.createIndex(nodes);

        this.graph.zoomToFit(timing, padding, (node) => {
            if (nodes.length === 0) return true;
            if (nodeIndex.has(node.id)) {
                return true;
            }
            return false;
        });
    }

    async stableZoom(shouldZoom = false, delay = 100, oldData = null) {
        if (this.isStable) {
            shouldZoom = true;
        }

        if (this.props.graphData.nodes.length === 1) {
            shouldZoom = true;
        }

        if (!this.lastPosition || shouldZoom) {
            await utils.delay(delay);
            this.zoom(oldData);

            await this.waitForStablePosition();
        } else {
            console.log("skip zoom");
        }
    }

    async waitForStablePosition(delay = 50, max = 50) {
        let i = 0;
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (this.isStable) {
                    console.log("stable camera");
                    clearInterval(interval);
                    resolve(this.position);
                }

                if (i++ > max) {
                    console.log("couldn't find stable camera");
                    clearInterval(interval);
                    return resolve(null);
                }

                this.updateLastPosition();

            }, delay);
        });

    }

    getNode(nodeUUID) {
        return this.props.graphData.nodes.find((node) => node.uuid === nodeUUID);
    }

    async zoomToNode(nodeUUID, delay = 0) {
        await utils.delay(delay);

        const camera = this.position;
        const node = this.getNode(nodeUUID);
        if (!node) {
            console.log("node not found");
            return;
        }

        this.fixNodePosition(node);

        // Define a fixed "up" vector (world up)
        const worldUp = { x: 0, y: 1, z: 0 };

        // Calculate normalized direction from the node to the camera
        let direction = {
            x: camera.x - node.x,
            y: camera.y - node.y,
            z: camera.z - node.z,
        };
        let mag = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        direction.x /= mag;
        direction.y /= mag;
        direction.z /= mag;

        // Determine the new camera position offset by 100 units away from the node
        let offsetDistance = 90; // Distance to offset from the node
        let newPosition = {
            x: node.x + direction.x * offsetDistance,
            y: node.y + direction.y * offsetDistance,
            z: node.z + direction.z * offsetDistance,
        };

        // Check if the new position is very close to flipping over
        let dotWithUp =
            direction.x * worldUp.x + direction.y * worldUp.y + direction.z * worldUp.z;
        if (Math.abs(dotWithUp) > 0.95) {
            // Threshold to adjust to avoid gimbal lock issues
            newPosition = {
                // Adjust position slightly to avoid direct alignment with up vector
                x: newPosition.x + worldUp.x * 10,
                y: newPosition.y + worldUp.y * 10,
                z: newPosition.z + worldUp.z * 10,
            };
        }

        // Update camera position and target
        this.graph.cameraPosition(
            newPosition, // new camera position
            { x: node.x, y: node.y, z: node.z }, // camera looks at the node
            1250 // transition duration in milliseconds
        );
    }

    fixNodePosition(node, reset = true) {
        for (const n of this.props.graphData.nodes) {
            if (n.uuid === node.uuid) {
                node.fx = node.x;
                node.fy = node.y;
                node.fz = node.z;
            } else {
                if (reset) {
                    delete n.fx;
                    delete n.fy;
                    delete n.fz;
                }
            }
        }

    }

}

function zoomPadding(numSymbols, graphType = "3d") {
    if (graphType === "2d") {
        return 100;
    }

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
        return 300;
    }
}
