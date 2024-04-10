import { CanvasCapture } from "canvas-capture";

/*
const _requestAnimationFrame = window.requestAnimationFrame.bind(window);
window.requestAnimationFrame = (callback) => {
    console.log("ANIMATION FRAME");
    // if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();
    _requestAnimationFrame(callback);
};
*/

/*
const _requestAnimationFrame = window.requestAnimationFrame.bind(window);
window.requestAnimationFrame = (callback) => {
    console.log("CALL");
    CanvasCapture.checkHotkeys();
    if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();
    _requestAnimationFrame(callback);
};
*/


let lastImageData = null;
function isCanvasBlank(canvas) {
    var image = canvas.toDataURL("image/png");

    if (lastImageData === image) {
        console.log("SAME IMAGE", image);
        return true;
    }

    lastImageData = image;

    return false;
}


export default class Record {

    static get canvas() {
        return document.querySelector("canvas");
    }

    static async recordVideo(name = "thinkmachine-video", quality = 1, fps = 30) {
        CanvasCapture.init(Record.canvas, { showRecDot: true });

        async function loop() {
            CanvasCapture.checkHotkeys();
            // if (CanvasCapture.isRecording() && !isCanvasBlank(Record.canvas)) {
            if (CanvasCapture.isRecording()) {
                CanvasCapture.recordFrame();
            }
            requestAnimationFrame(loop);
        }

        loop();

        CanvasCapture.bindKeyToVideoRecord("v", {
            format: "webm", // Options are optional, more info below.
            name: "myVideo",
            fps: 15,
            quality: 1,
        });

        /*

        let i = 0;
        let stop = false;
        async function loop() {
            console.log("LOOP");

            if (!stop) {
                requestAnimationFrame(loop);
            }

            i++;

            if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();

            if (i === 2) {
                console.log("TRIGGER");
                CanvasCapture.beginVideoRecord({
                    format: CanvasCapture.WEBM,
                });
            } else if (i == 100) {
                console.log("STOP");
                stop = true;
                CanvasCapture.stopRecord();
            }
        }

        loop(); // Start loop.
        */
    }

    static async takeScreenshot(name = "thinkmachine-screenshot", quality = 1, dpi = 300) {
        console.log("Taking screenshot");

        CanvasCapture.init(Record.canvas);

        window.requestAnimationFrame(() => {
            CanvasCapture.takeJPEGSnapshot({
                name,
                quality,
                dpi,
            });
        });
    }
}