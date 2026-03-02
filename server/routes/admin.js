const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllIdeas,
  deleteIdea,
  getPlatformStats,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/ideas", getAllIdeas);
router.delete("/ideas/:id", deleteIdea);
router.get("/stats", getPlatformStats);

module.exports = router;
