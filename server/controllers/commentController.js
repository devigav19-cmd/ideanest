const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Idea = require("../models/Idea");

// ── GET /api/comments/:ideaId ──────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const { type } = req.query; // optional: "feedback" or "discussion"
    const filter = { idea: req.params.ideaId };
    if (type) filter.type = type;

    const comments = await Comment.find(filter)
      .populate("author", "name avatar role")
      .sort("-createdAt");

    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/comments/:ideaId ─────────────────────────────────
exports.createComment = async (req, res) => {
  try {
    const { content, type } = req.body;
    const comment = await Comment.create({
      content,
      author: req.user._id,
      idea: req.params.ideaId,
      type: type || "feedback",
    });
    await comment.populate("author", "name avatar role");

    // Notify idea author
    const idea = await Idea.findById(req.params.ideaId);
    if (idea && idea.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: idea.author,
        sender: req.user._id,
        type: "new_comment",
        message: `${req.user.name} commented on your idea "${idea.title}"`,
        idea: idea._id,
      });
    }

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/comments/:id ───────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    await comment.deleteOne();
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
