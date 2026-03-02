const Investment = require("../models/Investment");
const Idea = require("../models/Idea");
const Notification = require("../models/Notification");

// ── POST /api/investments/:ideaId ── Send interest ─────────────
exports.sendInterest = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    const existing = await Investment.findOne({
      investor: req.user._id,
      idea: idea._id,
      status: "pending",
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Interest already sent" });

    const investment = await Investment.create({
      investor: req.user._id,
      idea: idea._id,
      message: req.body.message || "",
    });

    // Notify idea author
    await Notification.create({
      recipient: idea.author,
      sender: req.user._id,
      type: "investment_interest",
      message: `An investor is interested in your idea "${idea.title}"`,
      idea: idea._id,
    });

    res.status(201).json({ success: true, data: investment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/investments/my ── My sent interests (investor) ────
exports.getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ investor: req.user._id })
      .populate({
        path: "idea",
        select: "title category stage author upvotes",
        populate: { path: "author", select: "name" },
      })
      .sort("-createdAt");
    res.json({ success: true, data: investments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/investments/received ── Received interests (creator)
exports.getReceivedInvestments = async (req, res) => {
  try {
    // Get all ideas authored by current user, then find investments
    const ideas = await Idea.find({ author: req.user._id }).select("_id");
    const ideaIds = ideas.map((i) => i._id);

    const investments = await Investment.find({ idea: { $in: ideaIds } })
      .populate("investor", "name avatar email")
      .populate("idea", "title")
      .sort("-createdAt");

    res.json({ success: true, data: investments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/investments/:id ── Accept / Reject ────────────────
exports.updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate(
      "idea"
    );
    if (!investment)
      return res
        .status(404)
        .json({ success: false, message: "Investment request not found" });

    // Only the idea author can accept/reject
    if (investment.idea.author.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Status must be accepted or rejected" });

    investment.status = status;
    await investment.save();

    res.json({ success: true, data: investment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
