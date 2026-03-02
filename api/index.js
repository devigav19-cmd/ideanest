// Vercel Serverless Function entry point
// Imports the Express app from the server folder and re-exports it
const app = require("../server/server");

module.exports = app;
