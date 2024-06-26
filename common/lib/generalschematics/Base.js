import { v4 as uuidv4 } from 'uuid';

export default class Base {

    constructor() {
        this.uuid = uuidv4();
    }

    get name() {
        return this.constructor.name.toLowerCase();
    }

    get header() {
        return false;
    }

    filter(input) {
        if (typeof input === "string") {
            if (this.name === input) return this;
        } else if (typeof input === "function") {
            if (input(this)) return this;
        } else if (Array.isArray(input)) {
            throw new Error("Array input not supported");
        } else if (typeof input === "object") {
            for (const key in input) {
                if (this[key] !== input[key]) return null;
            }
            return this;
        } else {
            throw new Error("Invalid input type");
        }
    }

    get isHeaderOwned() {
        if (this.name === "header") return true;
        if (this.header) return true;
        return false;
    }
}