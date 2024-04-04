export async function saveFile(
    text,
    filename = "file.txt",
    type = "text/plain"
) {
    const blob = new Blob([text], { type });

    const a = document.createElement("a");
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.addEventListener("click", (e) => {
        setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
    });
    a.click();
}

export function isUUID(uuid) {
    const pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !!pattern.test(uuid);
}

export function readChunks(reader) {
    const decoder = new TextDecoder("utf-8");
    return {
        async *[Symbol.asyncIterator]() {
            let readResult = await reader.read();
            while (!readResult.done) {
                const value = decoder.decode(readResult.value);
                const lines = value.trim().split(/\n+/);
                for (const line of lines) {
                    const json = JSON.parse(line.split("data: ")[1]);
                    yield json;
                }
                readResult = await reader.read();
            }
        },
    };
}

export function setCookie(name, value, days = 365) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function eraseCookie(name) {
    document.cookie =
        name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}
