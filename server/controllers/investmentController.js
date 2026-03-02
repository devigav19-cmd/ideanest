const Investment = require("../models/Investment");
const Idea = require("../models/Idea");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ── POST /api/investments/:ideaId ── Send interest ─────────────
exports.sendInterest = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.ideaId);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    const existing = await Investment.findOne({
      where: { investorId: req.user.id, ideaId: idea.id, status: "pending" },
    });
    if (existing) return res.status(400).json({ success: false, message: "Interest already sent" });
    const investment = await Investment.create({
      investorId: req.user.id, ideaId: idea.id, message: req.body.message || "",
    });
    await Notification.create({
      recipientId: idea.authorId, senderId: req.user.id,
      type: "investment_interest",
      message: `An investor is interested in your idea "${idea.title}"`,
      ideaId: idea.id,
    });
    const v = investment.get({ plain: true }); v._id = v.id;
    res.status(201).json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/investments/my ── My sent interests (investor) ────
exports.getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.findAll({
      where: { investorId: req.user.id },
      include: [{
        model: Idea, as: "idea", attributes: ["id", "title", "category", "stage", "upvotes"],
        include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      }],
      order: [["createdAt", "DESC"]],
    });
    const data = investments.map((inv) => {
      const v = inv.get({ plain: true }); v._id = v.id;
      if (v.idea) { v.idea._id = v.idea.id; if (v.idea.author) v.idea.author._id = v.idea.author.id; }
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/investments/received ── Received interests (creator)
exports.getReceivedInvestments = async (req, res) => {
  try {
    const ideas = await Idea.findAll({ where: { authorId: req.user.id }, attributes: ["id"] });
    const ideaIds = ideas.map((i) => i.id);
    const investments = await Investment.findAll({
      where: { ideaId: ideaIds },
      include: [
        { model: User, as: "investor", attributes: ["id", "name", "avatar", "email"] },
        { model: Idea, as: "idea", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    const data = investments.map((inv) => {
      const v = inv.get({ plain: true }); v._id = v.id;
      if (v.investor) v.investor._id = v.investor.id;
      if (v.idea) v.idea._id = v.idea.id;
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── PUT /api/investments/:id ── Accept / Reject ────────────────
exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByPk(req.params.id, {
      include: [{ model: Idea, as: "idea" }],
    });
    if (!investment) return res.status(404).json({ success: false, message: "Investment request not found" });
    if (investment.idea.authorId !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Status must be accepted or rejected" });
    investment.status = status;
    await investment.save();
    const v = investment.get({ plain: true }); v._id = v.id;
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
