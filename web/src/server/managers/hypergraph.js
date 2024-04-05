import Hypergraph from "../models/hypergraph.js";
import ThinkableType from "@themaximalist/thinkabletype";
import colors from "../../common/lib/colors.js"

export default class HypergraphManager {

    static async getOrCreate(uuid) {
        let hypergraph = await Hypergraph.findByPk(uuid);
        if (hypergraph) return hypergraph;

        try {
            return await Hypergraph.create({ id: uuid });
        } catch (e) {
            // race condition...try to fetch it again
            if (e.name === "SequelizeUniqueConstraintError") {
                return await Hypergraph.findByPk(uuid);
            }

            throw e;
        }
    }

    static async thinkableTypeForUUID(uuid) {
        const hypergraph = await HypergraphManager.getOrCreate(uuid);
        const thinkabletype = new ThinkableType({ colors });
        thinkabletype.parse(hypergraph.data);
        return thinkabletype;
    }
}