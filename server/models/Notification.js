const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.ENUM(
        "collaboration_request",
        "collaboration_accepted",
        "collaboration_rejected",
        "investment_interest",
        "idea_upvote",
        "new_comment",
        "system"
      ),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ideaId: {
      type: DataTypes.UUID,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: true }
);

module.exports = Notification;
