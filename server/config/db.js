const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production" ? { require: true, rejectUnauthorized: false } : false,
  },
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log("All models synchronized");
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
