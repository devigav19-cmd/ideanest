const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
});

let dbReady = null;

const connectDB = () => {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
    await sequelize.sync();
    console.log("All models synchronized");
  })();
  return dbReady;
};

module.exports = { sequelize, connectDB };
