import Sequelize from "sequelize";
const DataTypes = Sequelize.DataTypes;

import sequelize from "../sequelize.js";

export default class Event extends Sequelize.Model {
}

Event.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    guid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    ip: {
        type: DataTypes.STRING,
        defaultValue: "0.0.0.0",
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        defaultValue: "",
        allowNull: false,
    },
    data: {
        type: DataTypes.TEXT,
        defaultValue: "",
        allowNull: false,
    },
    uuid: {
        type: DataTypes.UUID,
        defaultValue: "00000000-0000-0000-0000-000000000000",
        allowNull: true,
        primaryKey: true
    },
}, {
    sequelize,
});