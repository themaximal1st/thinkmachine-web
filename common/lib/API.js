import dotenv from "dotenv-extended";
dotenv.load();

import Media from "./Media.js";
import Explain from "./Explain.js"
import Chat from "./Chat.js"
import GenerateOne from "./GenerateOne.js";
import GenerateMany from "./GenerateMany.js";
import License from "./License.js";
import { webmToMp4, base64ToBuffer } from "./ffmpeg.js";

export default class API {
    async media(query) {
        return await Media(query, process.env.GOOGLE_SEARCH_ENGINE_ID, process.env.GOOGLE_SEARCH_API_KEY)
    }

    async *explain(name, hyperedges, options) {
        for await (const msg of Explain(name, hyperedges, options)) {
            yield msg;
        }
    }

    async *chat(messages, hyperedges, activeSymbol = null, options = {}) {
        for await (const msg of Chat(messages, hyperedges, activeSymbol, options)) {
            yield msg;
        }
    }

    async generateMany(user_prompt, activeSymbol, hyperedge, hyperedges, options = {}) {
        return await GenerateMany(user_prompt, activeSymbol, hyperedge, hyperedges, options);
    }

    async generateOne(activeSymbol, hyperedge, hyperedges, options = {}) {
        return await GenerateOne(activeSymbol, hyperedge, hyperedges, options);
    }

    async license(license) {
        return await License.check(license);
    }

    async webmToMp4(buffer) {
        return await webmToMp4(buffer);
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