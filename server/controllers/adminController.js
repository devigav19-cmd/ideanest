const User = require("../models/User");
const Idea = require("../models/Idea");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const { sequelize } = require("../config/db");

// ── GET /api/admin/users ───────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    const data = users.map((u) => { const v = u.get({ plain: true }); v._id = v.id; return v; });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── DELETE /api/admin/users/:id ────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await user.destroy();
    res.json({ success: true, message: "User deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/admin/ideas ───────────────────────────────────────
exports.getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.findAll({
      include: [{ model: User, as: "author", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });
    const data = ideas.map((i) => {
      const v = i.get({ plain: true }); v._id = v.id;
      if (v.author) v.author._id = v.author.id;
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── DELETE /api/admin/ideas/:id ────────────────────────────────
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    await idea.destroy();
    res.json({ success: true, message: "Idea deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/admin/stats ───────────────────────────────────────
exports.getPlatformStats = async (req, res) => {
  try {
    const Collaboration = require("../models/Collaboration");
    const Investment = require("../models/Investment");
    const [totalUsers, totalIdeas, totalComments, totalCollaborations, totalInvestments] = await Promise.all([
      User.count(), Idea.count(), Comment.count(), Collaboration.count(), Investment.count(),
    ]);
    const usersByRoleRaw = await User.findAll({
      attributes: ["role", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["role"], raw: true,
    });
    const usersByRole = usersByRoleRaw.map((r) => ({ _id: r.role, count: Number(r.count) }));
    const ideasByCategoryRaw = await Idea.findAll({
      attributes: ["category", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["category"], raw: true,
    });
    const ideasByCategory = ideasByCategoryRaw.map((r) => ({ _id: r.category, count: Number(r.count) }));
    res.json({
      success: true,
      data: { totalUsers, totalIdeas, totalComments, totalCollaborations, totalInvestments, usersByRole, ideasByCategory },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
