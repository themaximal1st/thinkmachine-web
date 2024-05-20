import { v4 as uuid } from 'uuid';

export default class Settings {

    // DEFAULTS

    static defaultGraphType = "3d";
    static defaultGraphData = { nodes: [], links: [] };

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

    get graphType() { return this.get("graphType", Settings.defaultGraphType) }
    set graphType(val) { this.set("graphType", val) }
    get graphData() { return this.get("graphData", Settings.defaultGraphData) }
    set graphData(val) { this.set("graphData", val) }

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

    static get graphType() { return Settings.get("graphType", Settings.defaultGraphType) }
    static set graphType(val) { Settings.set("graphType", val) }

}