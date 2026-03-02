const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Idea = require("../models/Idea");
const User = require("../models/User");

// ── GET /api/comments/:ideaId ──────────────────────────────────
exports.getComments = async (req, res) => {
  try {
    const where = { ideaId: req.params.ideaId };
    if (req.query.type) where.type = req.query.type;
    const comments = await Comment.findAll({
      where,
      include: [{ model: User, as: "author", attributes: ["id", "name", "avatar", "role"] }],
      order: [["createdAt", "DESC"]],
    });
    const data = comments.map((c) => {
      const v = c.get({ plain: true }); v._id = v.id;
      if (v.author) v.author._id = v.author.id;
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── POST /api/comments/:ideaId ─────────────────────────────────
exports.createComment = async (req, res) => {
  try {
    const { content, type } = req.body;
    const comment = await Comment.create({
      content, authorId: req.user.id, ideaId: req.params.ideaId,
      type: type || "feedback",
    });
    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name", "avatar", "role"] }],
    });
    const idea = await Idea.findByPk(req.params.ideaId);
    if (idea && idea.authorId !== req.user.id) {
      await Notification.create({
        recipientId: idea.authorId, senderId: req.user.id,
        type: "new_comment",
        message: `${req.user.name} commented on your idea "${idea.title}"`,
        ideaId: idea.id,
      });
    }
    const v = full.get({ plain: true }); v._id = v.id;
    if (v.author) v.author._id = v.author.id;
    res.status(201).json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── DELETE /api/comments/:id ───────────────────────────────────
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });
    if (comment.authorId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized" });
    await comment.destroy();
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
