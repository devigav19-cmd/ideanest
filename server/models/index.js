// ── Model Associations ──────────────────────────────────────────
const User = require("./User");
const Idea = require("./Idea");
const Comment = require("./Comment");
const Collaboration = require("./Collaboration");
const Investment = require("./Investment");
const Notification = require("./Notification");

// User -> Idea
User.hasMany(Idea, { foreignKey: "authorId", as: "ideas" });
Idea.belongsTo(User, { foreignKey: "authorId", as: "author" });

// User -> Comment
User.hasMany(Comment, { foreignKey: "authorId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "authorId", as: "author" });

// Idea -> Comment
Idea.hasMany(Comment, { foreignKey: "ideaId", as: "comments" });
Comment.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });

// Collaboration
User.hasMany(Collaboration, { foreignKey: "requesterId", as: "sentCollabs" });
User.hasMany(Collaboration, { foreignKey: "ownerId", as: "receivedCollabs" });
Collaboration.belongsTo(User, { foreignKey: "requesterId", as: "requester" });
Collaboration.belongsTo(User, { foreignKey: "ownerId", as: "owner" });
Collaboration.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });
Idea.hasMany(Collaboration, { foreignKey: "ideaId", as: "collaborations" });

// Investment
User.hasMany(Investment, { foreignKey: "investorId", as: "investments" });
Investment.belongsTo(User, { foreignKey: "investorId", as: "investor" });
Investment.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });
Idea.hasMany(Investment, { foreignKey: "ideaId", as: "investments" });

// Notification
User.hasMany(Notification, { foreignKey: "recipientId", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "recipientId", as: "recipient" });
Notification.belongsTo(User, { foreignKey: "senderId", as: "sender" });
Notification.belongsTo(Idea, { foreignKey: "ideaId", as: "idea" });

module.exports = { User, Idea, Comment, Collaboration, Investment, Notification };
