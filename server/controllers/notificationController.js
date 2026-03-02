const Notification = require("../models/Notification");
const User = require("../models/User");

// ── GET /api/notifications ─────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      include: [{ model: User, as: "sender", attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
      limit: 30,
    });
    const data = notifications.map((n) => {
      const v = n.get({ plain: true }); v._id = v.id;
      if (v.sender) v.sender._id = v.sender.id;
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── PUT /api/notifications/read-all ────────────────────────────
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { recipientId: req.user.id, isRead: false } }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
