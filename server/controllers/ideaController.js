const { Op } = require("sequelize");
const Idea = require("../models/Idea");
const User = require("../models/User");
const Notification = require("../models/Notification");

// ── GET /api/ideas ─────────────────────────────────────────────
exports.getIdeas = async (req, res) => {
  try {
    const { search, category, stage, sort = "-createdAt", page = 1, limit = 12 } = req.query;
    const where = { status: "active" };
    if (category) where.category = category;
    if (stage) where.stage = stage;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    let order = [["createdAt", "DESC"]];
    if (sort === "views" || sort === "-views") order = [["views", "DESC"]];
    if (sort === "createdAt") order = [["createdAt", "ASC"]];
    const offset = (Number(page) - 1) * Number(limit);
    const { count: total, rows: ideas } = await Idea.findAndCountAll({
      where, include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }],
      order, offset, limit: Number(limit),
    });
    const data = ideas.map((i) => {
      const v = i.get({ plain: true }); v._id = v.id; v.averageRating = i.averageRating;
      if (v.author) v.author._id = v.author.id; return v;
    });
    res.json({ success: true, data, pagination: { total, pages: Math.ceil(total / Number(limit)), page: Number(page) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/ideas/trending ────────────────────────────────────
exports.getTrending = async (req, res) => {
  try {
    const ideas = await Idea.findAll({ where: { status: "active" },
      include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }],
      order: [["views", "DESC"]], limit: 10,
    });
    const data = ideas.map((i) => { const v = i.get({ plain: true }); v._id = v.id; v.averageRating = i.averageRating; if (v.author) v.author._id = v.author.id; return v; });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/ideas/my ──────────────────────────────────────────
exports.getMyIdeas = async (req, res) => {
  try {
    const ideas = await Idea.findAll({ where: { authorId: req.user.id },
      include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
    });
    const data = ideas.map((i) => { const v = i.get({ plain: true }); v._id = v.id; v.averageRating = i.averageRating; if (v.author) v.author._id = v.author.id; return v; });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── GET /api/ideas/:id ─────────────────────────────────────────
exports.getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id, {
      include: [{ model: User, as: "author", attributes: ["id", "name", "avatar", "bio"] }],
    });
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    idea.views += 1; await idea.save();
    const v = idea.get({ plain: true }); v._id = v.id; v.averageRating = idea.averageRating;
    if (v.author) v.author._id = v.author.id;
    if (v.collaborators && v.collaborators.length > 0) {
      const collabUsers = await User.findAll({ where: { id: v.collaborators }, attributes: ["id", "name", "avatar"] });
      v.collaborators = collabUsers.map((u) => ({ _id: u.id, name: u.name, avatar: u.avatar }));
    }
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── POST /api/ideas ────────────────────────────────────────────
exports.createIdea = async (req, res) => {
  try {
    const { title, description, category, tags, stage } = req.body;
    const idea = await Idea.create({ title, description, category, tags: tags || [], stage, authorId: req.user.id });
    const author = await User.findByPk(req.user.id, { attributes: ["id", "name", "avatar"] });
    const v = idea.get({ plain: true }); v._id = v.id;
    v.author = { _id: author.id, name: author.name, avatar: author.avatar };
    res.status(201).json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── PUT /api/ideas/:id ─────────────────────────────────────────
exports.updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    if (idea.authorId !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });
    const allowed = ["title", "description", "category", "tags", "stage"];
    allowed.forEach((f) => { if (req.body[f] !== undefined) idea[f] = req.body[f]; });
    await idea.save();
    const author = await User.findByPk(idea.authorId, { attributes: ["id", "name", "avatar"] });
    const v = idea.get({ plain: true }); v._id = v.id;
    v.author = { _id: author.id, name: author.name, avatar: author.avatar };
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── DELETE /api/ideas/:id ──────────────────────────────────────
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    if (idea.authorId !== req.user.id && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Not authorized" });
    await idea.destroy();
    res.json({ success: true, message: "Idea deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── POST /api/ideas/:id/upvote ─────────────────────────────────
exports.upvoteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    const uid = req.user.id;
    let upvotes = [...(idea.upvotes || [])];
    let downvotes = [...(idea.downvotes || [])];
    downvotes = downvotes.filter((id) => id !== uid);
    const idx = upvotes.indexOf(uid);
    if (idx === -1) {
      upvotes.push(uid);
      if (idea.authorId !== uid) {
        await Notification.create({ recipientId: idea.authorId, senderId: uid, type: "idea_upvote",
          message: `${req.user.name} upvoted your idea "${idea.title}"`, ideaId: idea.id });
      }
    } else { upvotes.splice(idx, 1); }
    idea.upvotes = upvotes; idea.downvotes = downvotes;
    idea.changed("upvotes", true); idea.changed("downvotes", true);
    await idea.save();
    const reloaded = await Idea.findByPk(idea.id, { include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }] });
    const v = reloaded.get({ plain: true }); v._id = v.id; v.averageRating = reloaded.averageRating;
    if (v.author) v.author._id = v.author.id;
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── POST /api/ideas/:id/downvote ───────────────────────────────
exports.downvoteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    const uid = req.user.id;
    let upvotes = [...(idea.upvotes || [])];
    let downvotes = [...(idea.downvotes || [])];
    upvotes = upvotes.filter((id) => id !== uid);
    const idx = downvotes.indexOf(uid);
    if (idx === -1) { downvotes.push(uid); } else { downvotes.splice(idx, 1); }
    idea.upvotes = upvotes; idea.downvotes = downvotes;
    idea.changed("upvotes", true); idea.changed("downvotes", true);
    await idea.save();
    const reloaded = await Idea.findByPk(idea.id, { include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }] });
    const v = reloaded.get({ plain: true }); v._id = v.id; v.averageRating = reloaded.averageRating;
    if (v.author) v.author._id = v.author.id;
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── POST /api/ideas/:id/rate ───────────────────────────────────
exports.rateIdea = async (req, res) => {
  try {
    const idea = await Idea.findByPk(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: "Idea not found" });
    const { score } = req.body;
    if (!score || score < 1 || score > 5) return res.status(400).json({ success: false, message: "Score must be between 1 and 5" });
    let ratings = [...(idea.ratings || [])];
    const existing = ratings.find((r) => r.user === req.user.id);
    if (existing) { existing.score = score; } else { ratings.push({ user: req.user.id, score }); }
    idea.ratings = ratings; idea.changed("ratings", true);
    await idea.save();
    const reloaded = await Idea.findByPk(idea.id, { include: [{ model: User, as: "author", attributes: ["id", "name", "avatar"] }] });
    const v = reloaded.get({ plain: true }); v._id = v.id; v.averageRating = reloaded.averageRating;
    if (v.author) v.author._id = v.author.id;
    res.json({ success: true, data: v });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
