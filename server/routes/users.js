const express = require("express");
const router = express.Router();
const {
  getUserById,
  updateProfile,
  toggleBookmark,
  getBookmarks,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/bookmarks", protect, getBookmarks);
router.put("/profile", protect, updateProfile);
router.put("/bookmark/:ideaId", protect, toggleBookmark);
router.get("/:id", getUserById);

module.exports = router;
