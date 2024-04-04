const electron = require("electron");

export default class CrashReporter {
    static async load() {
        electron.crashReporter.start({
            companyName: "The Maximalist",
            productName: "Think Machine",
            submitURL:
                "https://HyperTyper.bugsplat.com/post/electron/crash.php",
            compress: true,
            ignoreSystemCrashHandler: true,
            rateLimit: false,
            globalExtra: {},
        });
    }
}
