const Collaboration = require("../models/Collaboration");
const Idea = require("../models/Idea");
const Notification = require("../models/Notification");

// ── POST /api/collaborations/:ideaId ── Request collaboration ──
exports.requestCollaboration = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.ideaId);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    if (idea.author.toString() === req.user._id.toString())
      return res
        .status(400)
        .json({ success: false, message: "You cannot collaborate on your own idea" });

    // Check duplicate request
    const existing = await Collaboration.findOne({
      idea: idea._id,
      requester: req.user._id,
      status: "pending",
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Request already sent" });

    const collab = await Collaboration.create({
      idea: idea._id,
      requester: req.user._id,
      owner: idea.author,
      message: req.body.message || "",
    });

    // Notify idea owner
    await Notification.create({
      recipient: idea.author,
      sender: req.user._id,
      type: "collaboration_request",
      message: `${req.user.name} wants to collaborate on "${idea.title}"`,
      idea: idea._id,
    });

    res.status(201).json({ success: true, data: collab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/collaborations/my ── Get my received requests ─────
exports.getMyRequests = async (req, res) => {
  try {
    const collabs = await Collaboration.find({ owner: req.user._id })
      .populate("requester", "name avatar email")
      .populate("idea", "title")
      .sort("-createdAt");
    res.json({ success: true, data: collabs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/collaborations/:id ── Accept or Reject ────────────
exports.updateCollaboration = async (req, res) => {
  try {
    const collab = await Collaboration.findById(req.params.id);
    if (!collab)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    if (collab.owner.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const { status } = req.body; // "accepted" or "rejected"
    if (!["accepted", "rejected"].includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Status must be accepted or rejected" });

    collab.status = status;
    await collab.save();

    // If accepted, add requester to idea collaborators
    if (status === "accepted") {
      await Idea.findByIdAndUpdate(collab.idea, {
        $addToSet: { collaborators: collab.requester },
      });
    }

    // Notify requester
    await Notification.create({
      recipient: collab.requester,
      sender: req.user._id,
      type:
        status === "accepted"
          ? "collaboration_accepted"
          : "collaboration_rejected",
      message: `Your collaboration request was ${status}`,
      idea: collab.idea,
    });

    res.json({ success: true, data: collab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
