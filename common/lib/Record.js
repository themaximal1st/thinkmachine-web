import { CanvasCapture } from "canvas-capture";

export default class Record {

    static get canvas() {
        return document.querySelector("canvas");
    }

    static async takeScreenshot(name = "thinkmachine-screenshot", quality = 1, dpi = 300) {
        console.log("Taking screenshot");

        CanvasCapture.init(Record.canvas, { showRecDot: true });

        // This is a hack because ForceGraph has its own requestAnimationFrame loop
        // ideally these would be synchronized, but for now we just need to wait for the next frame
        let i = 0;
        async function loop() {
            if (i < 2) {
                requestAnimationFrame(loop);
            }

            i++;

            if (i === 2) {
                await CanvasCapture.takeJPEGSnapshot({
                    name,
                    quality,
                    dpi,
                });
            }
        }

        loop();
    }
}