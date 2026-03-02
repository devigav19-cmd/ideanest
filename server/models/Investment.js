const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Investment = sequelize.define(
  "Investment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    investorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ideaId: {
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

module.exports = Investment;
