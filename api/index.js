// Vercel Serverless Function entry point
// Explicit requires so the bundler includes dynamically-loaded packages
require("pg");
require("pg-hstore");

let app;
try {
  app = require("../server/server");
} catch (err) {
  // If server fails to load, return a handler that reports the error
  app = (req, res) => {
    res.status(500).json({ error: "Server init failed", message: err.message, stack: err.stack });
  };
}

module.exports = app;
