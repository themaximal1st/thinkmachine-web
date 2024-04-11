import * as utils from "@lib/utils";

// Specific camera shots for Recorder.js
//
// These shots are tempremental.
// If the cameraPosition is too far from the original position, the recording will not always work
export default class RecorderShots {

    // 360 orbit
    static async orbit(app) {
        return new Promise(async (resolve, reject) => {
            if (app.recorder.recording) {
                console.log("already recording");
                return reject();
            }

            app.recorder.start();

            app.animation.start(async () => {
                app.recorder.stop();
                await app.asyncSetState({ isAnimating: false });
                resolve();
            });

            app.setState({ isAnimating: true });
        });
    }

    static async zoom(app) {
        return new Promise(async (resolve, reject) => {
            if (app.recorder.recording) {
                console.log("already recording");
                return reject();
            }

            const cameraPosition = app.graphRef.current.cameraPosition();
            let x = cameraPosition.x + 150;
            let y = cameraPosition.y + 150;
            let z = cameraPosition.z;

            app.graphRef.current.cameraPosition({ x, y, z }, null, 0);

            let initialZ = z;
            let interval = setInterval(async () => {
                const cameraPosition = app.graphRef.current.cameraPosition();
                if (cameraPosition.z < initialZ * -1) {
                    console.log("DONE!");
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
}