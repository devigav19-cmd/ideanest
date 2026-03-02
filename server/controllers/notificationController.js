const Notification = require("../models/Notification");

// ── GET /api/notifications ─────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name avatar")
      .sort("-createdAt")
      .limit(30);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/notifications/read-all ────────────────────────────
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
