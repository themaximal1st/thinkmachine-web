// import 'webm2mp4-js'
// import { CanvasCapture } from "canvas-capture";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

import * as services from "@src/services";

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
        this.bps = options.bps || bps["360p"];
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
        console.log("STOP");
        console.log(this.chunks);
        const blob = new Blob(this.chunks, { "type": this.chunks[0].type });

        console.log("NEW");
        const ffmpeg = new FFmpeg();

        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"

        console.log("LOADING");
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        console.log("LOADED");

        // ffmpeg.FS("writeFile", "video.webm", new Uint8Array(await blob.arrayBuffer()));
        console.log("WRITE");
        await ffmpeg.writeFile("video.webm", new Uint8Array(await blob.arrayBuffer()));

        console.log("EXEC");
        await ffmpeg.exec(['-i', 'video.webm', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');
        console.log(data);


        services.saveFile(data, "thinkmachine-video.mp4", "video/mp4");
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