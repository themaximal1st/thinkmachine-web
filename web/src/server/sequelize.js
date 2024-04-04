import dotenv from "dotenv-extended"
dotenv.load();

import { Sequelize } from "sequelize"
const sequelize = new Sequelize(process.env.DATABASE_URI);
export default sequelize;