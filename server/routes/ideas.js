const express = require("express");
const router = express.Router();
const {
  getIdeas,
  getTrending,
  getMyIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  upvoteIdea,
  downvoteIdea,
  rateIdea,
} = require("../controllers/ideaController");
const { protect } = require("../middleware/auth");

router.get("/trending", getTrending);
router.get("/my", protect, getMyIdeas);
router.get("/", getIdeas);
router.get("/:id", getIdeaById);
router.post("/", protect, createIdea);
router.put("/:id", protect, updateIdea);
router.delete("/:id", protect, deleteIdea);
router.post("/:id/upvote", protect, upvoteIdea);
router.post("/:id/downvote", protect, downvoteIdea);
router.post("/:id/rate", protect, rateIdea);

module.exports = router;
