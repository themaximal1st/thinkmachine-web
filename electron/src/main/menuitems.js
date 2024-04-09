import { MenuItem, dialog, shell } from "electron";
import * as services from "./services.js";

export function NewMenuItem(App) {
    return new MenuItem({
        label: "New Think Machine",
        accelerator: "CmdOrCtrl+N",
        click: services.newFile.bind(null, App),
    });
}

export function SaveMenuItem(App) {
    return new MenuItem({
        label: "Save Think Machine",
        accelerator: "CmdOrCtrl+S",
        click: services.saveFile.bind(null, App),
    });
}

export function LoadMenuItem(App) {
    return new MenuItem({
        label: "Load Think Machine",
        accelerator: "CmdOrCtrl+O",
        click: services.openFile.bind(null, App),
    });
}

export function SettingsMenuItem(App) {
    return new MenuItem({
        label: "Settings",
        accelerator: "CmdOrCtrl+,",
        click: () => {
            App.browserWindow.webContents.send(
                "message-from-main",
                "show-settings"
            );
        },
    });
}

export function LicenseMenuItem(App) {
    return new MenuItem({
        label: "License",
        click: () => {
            App.browserWindow.webContents.send(
                "message-from-main",
                "show-license-info"
            );
        },
    });
}
