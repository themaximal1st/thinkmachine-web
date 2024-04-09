import { join } from "path";
import { fileURLToPath } from "url";

import { app as electronApp, BrowserWindow, Menu, MenuItem, shell } from "electron";
import { electronApp as electronAppTools, optimizer, is } from "@electron-toolkit/utils";

import ElectronBridge from "./ElectronBridge";

import {
    NewMenuItem,
    LoadMenuItem,
    SaveMenuItem,
    LicenseMenuItem,
    SettingsMenuItem,
} from "./menuitems";

export default class DesktopApp {
    constructor(browserWindow) {
        this.electronApp = electronApp;
        this.browserWindow = browserWindow;
        this.bridge = null;
    }

    get thinkabletype() {
        if (!this.bridge) return null;
        return this.bridge.thinkabletype;
    }

    async load() {
        this.bridge = new ElectronBridge(this);
        await this.bridge.load();

        const menu = Menu.getApplicationMenu();
        if (!menu) return;

        let fileMenu = menu.items.find((m) => m.label === "File");
        if (!fileMenu) return;

        fileMenu.submenu.insert(0, new MenuItem({ type: "separator" }));
        fileMenu.submenu.insert(0, LicenseMenuItem(this));
        fileMenu.submenu.insert(0, new MenuItem({ type: "separator" }));
        fileMenu.submenu.insert(0, SettingsMenuItem(this));
        fileMenu.submenu.insert(0, new MenuItem({ type: "separator" }));
        fileMenu.submenu.insert(0, SaveMenuItem(this));
        fileMenu.submenu.insert(0, LoadMenuItem(this));
        fileMenu.submenu.insert(0, NewMenuItem(this));
        Menu.setApplicationMenu(menu);

        // open electron dev tools window
        if (is.dev) this.browserWindow.webContents.openDevTools();
    }

    static titleBarStyle() {
        if (process.platform === "darwin") {
            return "hiddenInset";
        }

        return "default";
    }

    static createWindow() {
        const browserWindow = new BrowserWindow({
            width: 900,
            height: 670,
            // frame: false,
            titleBarStyle: DesktopApp.titleBarStyle(),
            show: false,
            // autoHideMenuBar: true,
            webPreferences: {
                preload: fileURLToPath(
                    new URL("../preload/index.mjs", import.meta.url)
                ),
                sandbox: false,
            },
        });

        browserWindow.webContents.setFrameRate(60);

        browserWindow.on("ready-to-show", () => {
            browserWindow.show();
        });

        browserWindow.webContents.setWindowOpenHandler(({ url }) => {
            // config.fileProtocol is my custom file protocol
            // if (url.startsWith(config.fileProtocol)) {
            //     return { action: "allow" };
            // }
            // open url in a browser and prevent default
            shell.openExternal(url);
            return { action: "deny" };
        });

        // browserWindow.webContents.setWindowOpenHandler((details) => {
        //   shell.openExternal(details.url)
        //   return { action: 'deny' }
        // })

        // HMR for renderer base on electron-vite cli.
        if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
            browserWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
        } else {
            browserWindow.loadFile(join(__dirname, "../renderer/index.html"));
        }

        return browserWindow;
    }

    static async launch() {
        await electronApp.whenReady();

        electronAppTools.setAppUserModelId(electronApp.name);

        electronApp.on("browser-window-created", (_, window) => {
            optimizer.watchWindowShortcuts(window);
        });

        const browserWindow = DesktopApp.createWindow();

        // app.on('activate', function () {
        //   if (BrowserWindow.getAllWindows().length === 0) App.createWindow();
        // })

        electronApp.on("window-all-closed", () => {
            electronApp.quit();
        });

        const thinkmachine = new DesktopApp(browserWindow);
        await thinkmachine.load();

        return thinkmachine;
    }
}
