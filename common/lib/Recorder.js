// import { CanvasCapture } from "canvas-capture";

import * as services from "@src/services";

// TODO: Max size

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result.replace(/^data:.*;base64,/, "");
            resolve(result);
        }
        reader.readAsDataURL(blob);
    });
}

export function base64ToBlob(base64, mimeType) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
}

const bps = {
    "4K": 40000000,
    "2K": 16000000,
    "1080p": 8000000,
    "720p": 5000000,
    "480p": 2500000,
    "360p": 1000000
};

export default class Record {
    constructor(canvas = null, options = {}) {
        this.canvas = canvas || Record.canvas;
        if (!this.canvas) {
            console.error("Canvas not found");
            return;
        }

        this.fps = options.fps || 30;
        this.bps = options.bps || bps["4K"];
        this.mimetype = options.mimetype || "video/webm";


        this.stream = null;
        this.recorder = null;
        this.chunks = [];
        this.bytes = 0;
    }

    start() {
        if (!this.canvas) {
            console.error("Canvas not found");
            return;
        }

        if (this.stream) {
            console.error("Recording already started");
            return;
        }


        this.stream = this.canvas.captureStream(this.fps);
        console.log("STREAM", this.stream);

        this.recorder = new MediaRecorder(this.stream, {
            mimetype: this.mimetype,
            "bitspersecond": this.bps
        });

        this.recorder.addEventListener("start", this.onstart.bind(this), false);
        this.recorder.addEventListener("stop", this.onstop.bind(this), false);
        this.recorder.addEventListener("dataavailable", this.ondata.bind(this), false);
        this.recorder.addEventListener("error", this.onerror.bind(this), false);

        this.recorder.start(100);
    }

    stop() {
        if (this.recorder.state !== "inactive") {
            this.recorder.stop();
        }

        // this.recorder = null;
        // this.stream = null;
        // this.chunks = [];
        // this.bytes = 0;
    }

    onstart() {
        console.log("START");
    }

    async onstop() {
        if (this.chunks.length === 0) {
            console.error("No data recorded");
            return;
        }

        console.log("STOP");
        console.log(this.chunks);
        const blob = new Blob(this.chunks, { "type": this.chunks[0].type });
        console.log(blob);

        const buffer = await blobToBase64(blob);
        console.log(buffer);
        const mp4 = await window.api.convert.webmToMp4(buffer);

        // convert
        const mp4Blob = await base64ToBlob(mp4, "video/mp4");
        console.log("MP4", mp4Blob);

        services.saveFile(mp4Blob, "thinkmachine-video.mp4", "video/mp4");
    }

    ondata(event) {
        const blob = event.data;

        if (blob.size) {
            this.chunks.push(blob);
            this.bytes += blob.size;
        }
    }

    onerror(e) {
        console.log("ON ERROR", e);
    }


    static get canvas() {
        return document.querySelector("canvas");
    }

    /*
    static async recordVideo(name = "thinkmachine-video", fps = 30) {



    }
    */

    // recorder.removeEventListener(
    //     "dataavailable", fn, false
    // );
    // recorder("stop", fn, false);
    // recorder("error", fn, false);

    // if (recorder.state !== "inactive") {
    //     recorder.stop();
    // }


    static async _takeScreenshot(name = "thinkmachine-screenshot", quality = 1, dpi = 300) {
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