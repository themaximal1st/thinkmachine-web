export default class Settings {

    static get graphType() { return Settings.get("graphType") || "3d" }
    static set graphType(val) { Settings.set("graphType", val) }

    static get(key) {
        return localStorage.getItem(key);
    }

    static set(key, val) {
        localStorage.setItem(key, val);
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static resetAll() {
        localStorage.clear();
    }
}