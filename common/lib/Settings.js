import { v4 as uuid } from 'uuid';

export default class Settings {

    // LOCAL SETTINGS

    constructor(ns) {
        this.ns = ns || uuid();
    }

    namespace(key) { return `${this.ns}:${key}` }
    get(key, defaultValue) { return Settings.get(this.namespace(key), defaultValue) }
    set(key, val) { Settings.set(this.namespace(key), val) }
    remove(key) { Settings.remove(this.namespace(key)) }
    resetAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.ns)) {
                localStorage.removeItem(key);
            }
        });
    }

    get hypergraph() { return this.get("hypergraph", "") }
    set hypergraph(val) { this.set("hypergraph", val) }
    get interwingle() { return this.get("interwingle", 0) }
    set interwingle(val) { this.set("interwingle", val) }

    // GLOBAL SETTINGS

    static get(key, defaultValue = null) {
        try {
            return JSON.parse(localStorage.getItem(key)) || defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
    static set(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
    static remove(key) { localStorage.removeItem(key) }
    static resetAll() { localStorage.clear() }

    static get graphType() { return Settings.get("graphType", "3d") }
    static set graphType(val) { Settings.set("graphType", val) }

}