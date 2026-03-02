const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Idea = sequelize.define(
  "Idea",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "Technology",
        "Healthcare",
        "Education",
        "Finance",
        "Environment",
        "Social",
        "Other"
      ),
      defaultValue: "Other",
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    stage: {
      type: DataTypes.ENUM("Concept", "Prototype", "MVP", "Scaling"),
      defaultValue: "Concept",
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    collaborators: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    upvotes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    downvotes: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    ratings: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "archived", "flagged"),
      defaultValue: "active",
    },
  },
  {
    timestamps: true,
    getterMethods: {
      averageRating() {
        const r = this.getDataValue("ratings") || [];
        if (r.length === 0) return 0;
        const sum = r.reduce((acc, x) => acc + x.score, 0);
        return (sum / r.length).toFixed(1);
      },
      popularityScore() {
        return (
          (this.getDataValue("upvotes") || []).length -
          (this.getDataValue("downvotes") || []).length
        );
      },
    },
  }
);

// Helper for frontend compatibility
Idea.prototype.toSafeJSON = function () {
  const v = this.get({ plain: true });
  v._id = v.id;
  v.averageRating = this.averageRating;
  v.popularityScore = this.popularityScore;
  return v;
};

module.exports = Idea;
