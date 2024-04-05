import { dialog, shell } from "electron";
import Analytics from "./Analytics.js";
import fs from "fs";

export async function newFile(App) {
    Analytics.track("file.new");
    if (!(await promptBeforeErase(App))) return;

    // TODO: lol fix this
    // TODO: then fix generate / wormhole / scraping
    // TODO: how to use proxy api key for desktop?
    App.bridge.bridge.thinkabletype.reset();
    App.browserWindow.reload();
}

export async function openFile(App) {
    Analytics.track("file.load");
    if (!(await promptBeforeErase(App))) return;

    const options = {
        title: "Load ThinkableType File",
        buttonLabel: "Open",
        accelerator: "CmdOrCtrl+O",
        filters: [
            {
                name: "thinkabletype",
                extensions: ["hypertype"],
            },
            { name: "csv", extensions: ["csv"] },
            { name: "text", extensions: ["txt"] },
        ],
    };

    const { canceled, filePaths } = await dialog.showOpenDialog(
        App.browserWindow,
        options
    );

    if (canceled) return;

    const filePath = filePaths[0];
    if (!filePath) return;

    const contents = fs.readFileSync(filePath, "utf-8");
    App.bridge.thinkabletype.parse(contents);
    App.browserWindow.reload();
}

export function saveFile(App) {
    Analytics.track("file.save");
    const date = new Date();
    const filename = `~/Desktop/thinkabletype-${date.toISOString().replace(/:/g, "-")}.thinkabletype`;
    const options = {
        title: "Save ThinkableType File",
        accelerator: "CmdOrCtrl+S",
        defaultPath: filename,
        buttonLabel: "Save",
    };

    const filepath = dialog.showSaveDialogSync(App.browserWindow, options);

    const data = App.bridge.bridge.thinkabletype.export();
    fs.writeFileSync(filepath, data);

    shell.showItemInFolder(filepath);
}

async function promptBeforeErase(App) {
    console.log("APP", App);
    console.log("APP.BRIDGE", App.bridge);
    console.log("APP.BRIDGE", App.bridge.bridge);
    console.log("APP.BRIDGE.THINKABLETYPE", App.bridge.bridge.thinkabletype);
    console.log("APP.BRIDGE.THINKABLETYPE.HYPEREDGES", App.bridge.bridge.thinkabletype.hyperedges);

    if (App.bridge.bridge.thinkabletype.hyperedges.length === 0) return true;

    const { response } = await dialog.showMessageBox(App.browserWindow, {
        type: "question",
        title: "Confirmation",
        message:
            "Delete current ThinkableType file and start a new one? All unsaved changes will be lost.",
        buttons: ["No", "Yes"],
    });

    return response === 1;
}
