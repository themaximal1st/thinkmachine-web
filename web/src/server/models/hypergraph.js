import Sequelize from "sequelize";
const DataTypes = Sequelize.DataTypes;

import sequelize from "../sequelize.js";

export default class Hypergraph extends Sequelize.Model {
}

Hypergraph.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    guid: {
        type: DataTypes.UUID,
        defaultValue: "00000000-0000-0000-0000-000000000000",
        allowNull: false,
    },
    data: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize,
});
