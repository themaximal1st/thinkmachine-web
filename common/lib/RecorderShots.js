import * as utils from "@lib/utils";
import toast, { Toaster } from "react-hot-toast";

// Specific camera shots for Recorder.js
export default class RecorderShots {


    // 360 orbit
    static async orbit(app) {
        return new Promise(async (resolve, reject) => {
            if (!RecorderShots.needsOrbit(app)) {
                toast.error("Orbit recording needs 3D and orbit mode");
                return reject();
            }

            app.recorder.start();

            app.animation.start(async () => {
                app.recorder.stop();
                await app.toggleAnimation(false);
                resolve();
            });

            app.setState({ isAnimating: true });
        });
    }

    static async flyby(app) {
        return new Promise(async (resolve, reject) => {
            if (!RecorderShots.needsOrbit(app)) {
                toast.error("Flyby recording needs 3D and orbit mode");
                return reject();
            }

            await app.reloadData({ zoom: true });

            let x = 150;
            let y = 150;
            let z = 200;

            app.graphRef.current.cameraPosition({ x, y, z }, null, 500);

            await utils.delay(1000);

            let initialZ = z;
            let interval = setInterval(async () => {
                const cameraPosition = app.graphRef.current.cameraPosition();
                if (cameraPosition.z < initialZ * -1) {
                    clearInterval(interval);
                    app.recorder.stop();
                    app.asyncSetState({ isAnimating: false });
                    return resolve();
                }
                await app.zoom(-1);
            }, 10);

            await app.asyncSetState({ isAnimating: true });
            app.recorder.start();
        });
    }

    static async zoom(app) {
        return new Promise(async (resolve, reject) => {
            if (!RecorderShots.needsFly(app)) {
                toast.error("Zoom recording needs 3D and fly mode");
                return reject();
            }

            await app.reloadData({ zoom: true });

            const cameraPosition = app.graphRef.current.cameraPosition();
            let x = 0;
            let y = 0;
            let z = cameraPosition.z;// + 500;

            let initialPosition = cameraPosition;

            app.graphRef.current.cameraPosition({ x, y, z }, null, 500);

            await delay(1000);

            let interval = setInterval(async () => {
                const cameraPosition = app.graphRef.current.cameraPosition();
                if (cameraPosition.z < 0) {
                    console.log("DONE!");
                    clearInterval(interval);
                    app.recorder.stop();
                    app.asyncSetState({ isAnimating: false });

                    app.graphRef.current.cameraPosition(initialPosition, null, 500);
                    return resolve();
                }
                await app.zoom(-1);
            }, 10);

            await app.asyncSetState({ isAnimating: true });
            app.recorder.start();
        });
    }

    static needsOrbit(app) {
        if (app.recorder.recording) {
            console.log("already recording");
            return false;
        }

        if (app.state.graphType !== "3d") {
            console.log("needs 3d mode");
            return false;
        }

        if (app.state.controlType !== "orbit") {
            console.log("needs orbit mode");
            return false;
        }

        return true;
    }

    static needsFly(app) {
        if (app.recorder.recording) {
            console.log("already recording");
            return false;
        }

        if (app.state.graphType !== "3d") {
            console.log("needs 3d mode");
            return false;
        }

        if (app.state.controlType !== "fly") {
            console.log("needs fly mode");
            return false;
        }

        return true;
    }
}