import debug from "debug";
const log = debug("hummingbird:database");

import sequelize from "./sequelize.js"

export default class Database {
    static async initialize(alter = true) {
        log("initializing");
        await sequelize.sync({ alter });
    }

    static async close() {
        log("closing");
        await sequelize.close();
    }
}
