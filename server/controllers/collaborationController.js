const Collaboration = require("../models/Collaboration");
const Idea = require("../models/Idea");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ── POST /api/collaborations/:ideaId ── Request collaboration ──
exports.requestCollaboration = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.ideaId);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    if (idea.authorId === req.user.id)
      return res.status(400).json({ success: false, message: "You cannot collaborate on your own idea" });
    const existing = await Collaboration.findOne({
      where: { ideaId: idea.id, requesterId: req.user.id, status: "pending" },
    });
    if (existing) return res.status(400).json({ success: false, message: "Request already sent" });
    const collab = await Collaboration.create({
      ideaId: idea.id, requesterId: req.user.id, ownerId: idea.authorId,
      message: req.body.message || "",
    });
    await Notification.create({
      recipientId: idea.authorId, senderId: req.user.id,
      type: "collaboration_request",
      message: `${req.user.name} wants to collaborate on "${idea.title}"`,
      ideaId: idea.id,
    });
    const v = collab.get({ plain: true }); v._id = v.id;
    res.status(201).json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/collaborations/my ── Get my received requests ─────
exports.getMyRequests = async (req, res) => {
  try {
    const collabs = await Collaboration.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: User, as: "requester", attributes: ["id", "name", "avatar", "email"] },
        { model: Idea, as: "idea", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    const data = collabs.map((c) => {
      const v = c.get({ plain: true }); v._id = v.id;
      if (v.requester) v.requester._id = v.requester.id;
      if (v.idea) v.idea._id = v.idea.id;
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── PUT /api/collaborations/:id ── Accept or Reject ────────────
exports.updateCollaboration = async (req, res) => {
  try {
    const collab = await Collaboration.findByPk(req.params.id);
    if (!collab) return res.status(404).json({ success: false, message: "Request not found" });
    if (collab.ownerId !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status))
      return res.status(400).json({ success: false, message: "Status must be accepted or rejected" });
    collab.status = status;
    await collab.save();
    if (status === "accepted") {
      const idea = await Idea.findByPk(collab.ideaId);
      if (idea) {
        const collaborators = [...(idea.collaborators || [])];
        if (!collaborators.includes(collab.requesterId)) {
          collaborators.push(collab.requesterId);
          idea.collaborators = collaborators;
          idea.changed("collaborators", true);
          await idea.save();
        }
      }
    }
    await Notification.create({
      recipientId: collab.requesterId, senderId: req.user.id,
      type: status === "accepted" ? "collaboration_accepted" : "collaboration_rejected",
      message: `Your collaboration request was ${status}`,
      ideaId: collab.ideaId,
    });
    const v = collab.get({ plain: true }); v._id = v.id;
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
