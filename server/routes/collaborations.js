const express = require("express");
const router = express.Router();
const {
  requestCollaboration,
  getMyRequests,
  updateCollaboration,
} = require("../controllers/collaborationController");
const { protect } = require("../middleware/auth");

router.post("/:ideaId", protect, requestCollaboration);
router.get("/my", protect, getMyRequests);
router.put("/:id", protect, updateCollaboration);

module.exports = router;
