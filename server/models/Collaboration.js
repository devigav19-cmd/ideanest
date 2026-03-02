const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Collaboration = sequelize.define(
  "Collaboration",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ideaId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  { timestamps: true }
);

module.exports = Collaboration;
