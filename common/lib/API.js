import dotenv from "dotenv-extended";
dotenv.load();

import Media from "./Media.js";

export default class API {
    async media(query) {
        return await Media(query, process.env.GOOGLE_SEARCH_ENGINE_ID, process.env.GOOGLE_SEARCH_API_KEY)
    }

    async *explain(name) {
        console.log("EXPLAINING", name);
        yield "BLAMO1"
        yield "BLAMO2"
        yield "BLAMO3"
        yield "BLAMO4"
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