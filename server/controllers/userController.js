const User = require("../models/User");

// ── GET /api/users/:id ─────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/users/profile ─────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      "name",
      "bio",
      "skills",
      "portfolioLinks",
      "areasOfInterest",
      "avatar",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/users/bookmark/:ideaId ────────────────────────────
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const ideaId = req.params.ideaId;
    const idx = user.bookmarkedIdeas.indexOf(ideaId);

    if (idx === -1) {
      user.bookmarkedIdeas.push(ideaId);
    } else {
      user.bookmarkedIdeas.splice(idx, 1);
    }

    await user.save();
    res.json({
      success: true,
      bookmarkedIdeas: user.bookmarkedIdeas,
      bookmarked: idx === -1,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/users/bookmarks ───────────────────────────────────
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarkedIdeas",
      populate: { path: "author", select: "name" },
    });
    res.json({ success: true, data: user.bookmarkedIdeas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
