export async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function blobToBase64(blob) {
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


export function downloadImage(data, filename = "untitled.png") {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    a.click();
}
