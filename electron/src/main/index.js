import ThinkableType from "@themaximalist/thinkabletype";
import Bridge from "./bridge.js";
import App from "./app.js";
import Analytics from "./Analytics.js";
import CrashReporter from "./CrashReporter.js";
import updater from "electron-updater";
import colors from "./colors.js";

(async function () {
    await CrashReporter.load();
    await Analytics.load();
    Analytics.track("app.init");

    updater.autoUpdater.checkForUpdatesAndNotify();

    const thinkabletype = new ThinkableType({ colors });
    const thinkmachine = await App.launch(thinkabletype);
    await Bridge.load(thinkabletype, thinkmachine);
})();
