const User = require("../models/User");
const Idea = require("../models/Idea");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");

// ── GET /api/admin/users ───────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort("-createdAt");
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/admin/users/:id ────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/ideas ───────────────────────────────────────
exports.getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate("author", "name email")
      .sort("-createdAt");
    res.json({ success: true, data: ideas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/admin/ideas/:id ────────────────────────────────
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    await idea.deleteOne();
    res.json({ success: true, message: "Idea deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/stats ───────────────────────────────────────
exports.getPlatformStats = async (req, res) => {
  try {
    const Collaboration = require("../models/Collaboration");
    const Investment = require("../models/Investment");

    const [totalUsers, totalIdeas, totalComments, totalCollaborations, totalInvestments] = await Promise.all([
      User.countDocuments(),
      Idea.countDocuments(),
      Comment.countDocuments(),
      Collaboration.countDocuments(),
      Investment.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const ideasByCategory = await Idea.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalIdeas,
        totalComments,
        totalCollaborations,
        totalInvestments,
        usersByRole,
        ideasByCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
