export default class API {
    media(query) {
        return ["meta", "data", "api", query];
    }

    funky(name, here, and, more) {
        return {
            "funky": "funky",
            name,
            here,
            and,
            more
        }
    }

    get methods() {
        const proto = Object.getPrototypeOf(this);
        return Object.getOwnPropertyNames(proto).filter((method) => {
            if (method === "constructor") return false;
            if (method === "methods") return false;
            if (typeof this[method] !== "function") return false;
            return true;
        });
    }
}