import { v4 as uuid } from 'uuid';
import localForage from 'localforage';

export default class LocalStorage {
    constructor(ns) {
        this.ns = ns || uuid();
        this.blob = new BlobStorage(this.ns);
    }

    namespace(key) { return `${this.ns}:${key}` }
    get(key, defaultValue) { return LocalStorage.get(this.namespace(key), defaultValue) }
    set(key, val) { LocalStorage.set(this.namespace(key), val) }
    remove(key) { LocalStorage.remove(this.namespace(key)) }
    resetAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.ns)) {
                localStorage.removeItem(key);
            }
        });
    }
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
}

class BlobStorage {
    constructor(ns) {
        this.ns = ns || uuid();
    }

    namespace(key) { return `${this.ns}:${key}` }
    async get(key, defaultValue) {
        return (await localForage.getItem(this.namespace(key))) || defaultValue;
    }

    async set(key, val) {
        return await localForage.setItem(this.namespace(key), val)
    }

    async remove(key) {
        return await localForage.removeItem(this.namespace(key))
    }

    async resetAll() {
        const keys = await localForage.keys();
        keys.forEach(key => {
            if (key.startsWith(this.ns)) {
                localForage.removeItem(key);
            }
        });
    }
}