import { contextBridge, ipcRenderer } from "electron";
import Client from "@lib/Client";

const client = new Client();
client.handler = ipcRenderer.invoke;

try {
    contextBridge.exposeInMainWorld("api", client.api);
} catch (error) {
    console.error(error);
}