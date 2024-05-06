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



export function wordWrap(text, maxLen = 80) {
    if (!text || text.length === 0) return "";

    const words = text.split(' ');
    let currentLine = '';
    let result = '';

    for (const word of words) {
        // Handle existing newlines within words
        const parts = word.split('\n');
        parts.forEach((part, index) => {
            if (currentLine.length + part.length + 1 > maxLen) {
                // Add the current line to result if it's not empty
                if (currentLine.trim()) {
                    result += currentLine.trim() + '\n';
                }
                currentLine = part + ' '; // Start new line with the part of the word
            } else {
                currentLine += part + ' ';
            }
            // If the part was followed by a newline, add the current line and reset
            if (index !== parts.length - 1) {
                result += currentLine.trim() + '\n';
                currentLine = ''; // Reset line after an explicit newline
            }
        });
    }
    // Add any remaining text to the result
    if (currentLine.trim()) {
        result += currentLine.trim();
    }

    return result;
}


