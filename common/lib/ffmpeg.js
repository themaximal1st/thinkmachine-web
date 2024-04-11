import { exec } from "child_process";
import * as uuid from "./uuid.js";
import fs from "fs"

// Convert webm buffer to mp4 buffer
// ...not great. ideally could just be done in the browser, but output is webm which also isn't great
// Expects ffmpeg to be in path
export async function webmToMp4(buffer) {
    const input = `/tmp/${uuid.generate()}.webm`;
    fs.writeFileSync(input, buffer);

    const output = `/tmp/${uuid.generate()}.mp4`;
    function cleanup() {
        if (fs.existsSync(input)) {
            fs.unlinkSync(input);
        }

        if (fs.existsSync(output)) {
            fs.unlinkSync(output);
        }
    }

    return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -i "${input}"  -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset veryslow -crf 18 -pix_fmt yuv420p -an "${output}"`

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                cleanup();
                return reject(error);
            }

            const mp4buffer = fs.readFileSync(output);

            if (!mp4buffer) {
                cleanup();
                return reject("No mp4 buffer");
            }

            cleanup();
            resolve(mp4buffer);
        });
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

export async function base64ToBuffer(base64, mimeType = "video/webm") {
    const blob = base64ToBlob(base64, mimeType);
    return Buffer.from(await blob.arrayBuffer());
}