import dotenv from "dotenv-extended";
dotenv.load();

import Media from "./Media.js";
import Explain from "./Explain.js"

export default class API {
    async media(query) {
        return await Media(query, process.env.GOOGLE_SEARCH_ENGINE_ID, process.env.GOOGLE_SEARCH_API_KEY)
    }

    async *explain(name, hyperedges, options) {
        for await (const msg of Explain(name, hyperedges, options)) {
            yield msg;
        }
    }

    get methods() {
        const proto = Object.getPrototypeOf(this);
        return Object.getOwnPropertyNames(proto).filter((method) => {
            if (method === "constructor") return false;
            if (method === "methods") return false;
            if (typeof this[method] !== "function" && typeof this[method] !== "async function") return false;
            return true;
        });
    }
}