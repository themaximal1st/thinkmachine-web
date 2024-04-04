import DesktopApp from "./DesktopApp.js";
import Analytics from "./Analytics.js";
import CrashReporter from "./CrashReporter.js";
import updater from "electron-updater";

(async function () {
    await CrashReporter.load();
    await Analytics.load();
    Analytics.track("app.init");
    updater.autoUpdater.checkForUpdatesAndNotify();
    await DesktopApp.launch();
})();