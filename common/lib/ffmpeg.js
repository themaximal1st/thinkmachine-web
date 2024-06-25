import { exec } from "child_process";
import fs from "fs"
import temp from "temp"

// Convert webm buffer to mp4 buffer
// ...not great. ideally could just be done in the browser, but output is webm which also isn't great
// Expects ffmpeg to be in path
export async function webmToMp4(base64buffer) {
    const input = temp.path({ suffix: '.webm' });
    const buffer = await base64ToBuffer(base64buffer);
    fs.writeFileSync(input, buffer);
    const output = temp.path({ suffix: '.mp4' });

    function cleanup() {
        if (fs.existsSync(input)) {
            fs.unlinkSync(input);
        }

        if (fs.existsSync(output)) {
            fs.unlinkSync(output);
        }
    }

    return new Promise((resolve, reject) => {
        const cmd = `ffmpeg -fflags +genpts -i "${input}" -r 24 "${output}"`
        // const cmd = `ffmpeg -i "${input}"  -vf "crop=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -preset slow -r 30 -crf 20 -pix_fmt yuv420p -an "${output}"`

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
                cleanup();
                return reject(error);
            }

            const mp4buffer = fs.readFileSync(output, { encoding: 'base64' });

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