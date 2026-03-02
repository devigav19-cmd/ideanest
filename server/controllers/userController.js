const User = require("../models/User");
const Idea = require("../models/Idea");

// ── GET /api/users/:id ─────────────────────────────────────────
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const v = user.get({ plain: true }); v._id = v.id;
    res.json({ success: true, user: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── PUT /api/users/profile ─────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "bio", "skills", "portfolioLinks", "areasOfInterest", "avatar"];
    const user = await User.findByPk(req.user.id);
    allowed.forEach((f) => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    await user.save();
    const v = user.get({ plain: true }); v._id = v.id;
    res.json({ success: true, user: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── PUT /api/users/bookmark/:ideaId ────────────────────────────
exports.toggleBookmark = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const ideaId = req.params.ideaId;
    let bookmarks = [...(user.bookmarkedIdeas || [])];
    const idx = bookmarks.indexOf(ideaId);
    if (idx === -1) { bookmarks.push(ideaId); } else { bookmarks.splice(idx, 1); }
    user.bookmarkedIdeas = bookmarks;
    user.changed("bookmarkedIdeas", true);
    await user.save();
    res.json({ success: true, bookmarkedIdeas: user.bookmarkedIdeas, bookmarked: idx === -1 });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/users/bookmarks ───────────────────────────────────
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const bookmarkIds = user.bookmarkedIdeas || [];
    if (bookmarkIds.length === 0) return res.json({ success: true, data: [] });
    const ideas = await Idea.findAll({
      where: { id: bookmarkIds },
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
    });
    const data = ideas.map((i) => {
      const v = i.get({ plain: true }); v._id = v.id;
      if (v.author) v.author._id = v.author.id;
      return v;
    });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
