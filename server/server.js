const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/ideas", require("./routes/ideas"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/collaborations", require("./routes/collaborations"));
app.use("/api/investments", require("./routes/investments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "IdeaNest API is running 🚀" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// When deployed on Vercel, we export the app and let the platform handle
// listening. The following export makes the app available as a Serverless Function
// while still allowing a standalone server during local development.

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
