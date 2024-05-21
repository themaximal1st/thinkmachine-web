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

    get position() {
        return new CameraPosition(this.graph.cameraPosition());
    }

    get isStable() {
        return this.position.equals(this.lastPosition);
    }

    updateLastPosition() {
        this.lastPosition = this.position;
    }

    zoom(oldData = null, timing = 250) {
        console.log("ZOOM");
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

/*
function cameraEqual(camera1, camera2) {
    if (!camera1 || !camera2) return false;
    return (camera1.x === camera2.x && camera1.y === camera2.y && camera1.z === camera2.z);
}
*/