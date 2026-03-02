const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("creator", "collaborator", "investor", "admin"),
      defaultValue: "creator",
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    portfolioLinks: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    areasOfInterest: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    bookmarkedIdeas: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method to compare passwords
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Helper to get plain user object (like Mongoose toJSON)
User.prototype.toSafeJSON = function () {
  const values = this.get({ plain: true });
  delete values.password;
  // Map 'id' to '_id' for frontend compatibility
  values._id = values.id;
  return values;
};

module.exports = User;
