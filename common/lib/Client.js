const isElectron = process.versions.hasOwnProperty('electron');
let handler;
if (isElectron) {
    const electron = await import("electron");
    handler = electron.ipcRenderer.invoke;
}

export default class Client {

    get api() {
        return {
            media: (query) => {
                return handler("media", query);
            }
        }
    }

    handle(name, ...args) {
        return handler(name, ...args);
    }
}

// const api = {
//     "edition": "electron",
//     "media": (query) => {
//         return ipcRenderer.invoke("media", query);
//     }
// }