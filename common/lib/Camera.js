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

    // Think through what we want to do here
    // Higher level of abstraction
    // not just zoom
    // but zoom and fit, and look at node
    zoom() {

        console.log("ZOOM");
        const padding = zoomPadding(this.props.graphData.nodes.length, this.props.graphType);
        this.graph.zoomToFit(250, padding);
        // this.graph.zoomToFit(200, padding, (node) => {
        //     return true
        // });

        // 1. get camera position
        // 2. see if camera position is stable
        // 3. always zoom in some cases
        // 4. zoom
        // 5. wait for stable camera position
        // const cameraPosition = this.graph.cameraPosition();
        // console.log(cameraPosition);

        // console.log("ZOOM", padding);
    }

    async stableZoom(delay = 100, shouldZoom = false) {

        if (!this.lastPosition) {
            shouldZoom = true;
        }

        if (this.isStable) {
            shouldZoom = true;
        }

        if (this.props.graphData.nodes.length === 1) {
            shouldZoom = true;
        }

        if (shouldZoom) {
            await utils.delay(delay);
            this.zoom();
        }

        // await this.waitForStablePosition();
    }

    async waitForStablePosition(delay = 50, max = 50) {
        console.log("WAITING FOR STABLE POSITION");

        let i = 0;
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (this.isStable) {
                    console.log("FOUND STABLE POSITION");
                    clearInterval(interval);
                    resolve(this.position);
                }

                if (i++ > max) {
                    console.log("ERROR FINDING STABLE CAMERA");
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