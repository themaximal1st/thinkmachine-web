import { v4 as uuid } from 'uuid';

export default class Settings {

    // DEFAULTS

    static defaultGraphType = "3d";

    // LOCAL SETTINGS

    constructor(ns) {
        this.ns = ns || uuid();
    }

    namespace(key) { return `${this.ns}:${key}` }
    get(key) { return localStorage.getItem(this.namespace(key)) }
    set(key, val) { localStorage.setItem(this.namespace(key), val) }
    remove(key) { localStorage.removeItem(this.namespace(key)) }
    resetAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.ns)) {
                localStorage.removeItem(key);
            }
        });
    }

    get graphType() { return this.get("graphType") || Settings.defaultGraphType }
    set graphType(val) { this.set("graphType", val) }

    // GLOBAL SETTINGS

    static get(key) { return localStorage.getItem(key) }
    static set(key, val) { localStorage.setItem(key, val) }
    static remove(key) { localStorage.removeItem(key) }
    static resetAll() { localStorage.clear() }

    static get graphType() { return Settings.get("graphType") || this.defaultGraphType }
    static set graphType(val) { Settings.set("graphType", val) }

}