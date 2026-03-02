const Idea = require("../models/Idea");
const Notification = require("../models/Notification");

// ── GET /api/ideas ─────────────────────────────────────────────
exports.getIdeas = async (req, res) => {
  try {
    const {
      search,
      category,
      stage,
      sort = "-createdAt",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: "active" };
    if (category) query.category = category;
    if (stage) query.stage = stage;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Idea.countDocuments(query);
    const ideas = await Idea.find(query)
      .populate("author", "name avatar")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: ideas,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: Number(page),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ideas/trending ────────────────────────────────────
exports.getTrending = async (req, res) => {
  try {
    const ideas = await Idea.find({ status: "active" })
      .populate("author", "name avatar")
      .sort("-views")
      .limit(10);
    res.json({ success: true, data: ideas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ideas/my ──────────────────────────────────────────
exports.getMyIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ author: req.user._id })
      .populate("author", "name avatar")
      .sort("-createdAt");
    res.json({ success: true, data: ideas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/ideas/:id ─────────────────────────────────────────
exports.getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate("author", "name avatar bio")
      .populate("collaborators", "name avatar");
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    // Increment views
    idea.views += 1;
    await idea.save();

    res.json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ideas ────────────────────────────────────────────
exports.createIdea = async (req, res) => {
  try {
    const { title, description, category, tags, stage } = req.body;
    const idea = await Idea.create({
      title,
      description,
      category,
      tags,
      stage,
      author: req.user._id,
    });
    await idea.populate("author", "name avatar");
    res.status(201).json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/ideas/:id ─────────────────────────────────────────
exports.updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    if (idea.author.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const allowed = ["title", "description", "category", "tags", "stage"];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) idea[f] = req.body[f];
    });

    await idea.save();
    await idea.populate("author", "name avatar");
    res.json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/ideas/:id ──────────────────────────────────────
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    // Owner or admin can delete
    if (
      idea.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    await idea.deleteOne();
    res.json({ success: true, message: "Idea deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ideas/:id/upvote ─────────────────────────────────
exports.upvoteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    const uid = req.user._id;

    // Remove from downvotes if present
    idea.downvotes = idea.downvotes.filter((id) => id.toString() !== uid.toString());

    // Toggle upvote
    const idx = idea.upvotes.findIndex((id) => id.toString() === uid.toString());
    if (idx === -1) {
      idea.upvotes.push(uid);

      // Notify idea author
      if (idea.author.toString() !== uid.toString()) {
        await Notification.create({
          recipient: idea.author,
          sender: uid,
          type: "idea_upvote",
          message: `${req.user.name} upvoted your idea "${idea.title}"`,
          idea: idea._id,
        });
      }
    } else {
      idea.upvotes.splice(idx, 1);
    }

    await idea.save();
    await idea.populate("author", "name avatar");
    await idea.populate("collaborators", "name avatar");
    res.json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ideas/:id/downvote ───────────────────────────────
exports.downvoteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    const uid = req.user._id;

    // Remove from upvotes if present
    idea.upvotes = idea.upvotes.filter((id) => id.toString() !== uid.toString());

    // Toggle downvote
    const idx = idea.downvotes.findIndex((id) => id.toString() === uid.toString());
    if (idx === -1) {
      idea.downvotes.push(uid);
    } else {
      idea.downvotes.splice(idx, 1);
    }

    await idea.save();
    await idea.populate("author", "name avatar");
    await idea.populate("collaborators", "name avatar");
    res.json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/ideas/:id/rate ───────────────────────────────────
exports.rateIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea)
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });

    const { score } = req.body;
    if (!score || score < 1 || score > 5)
      return res
        .status(400)
        .json({ success: false, message: "Score must be between 1 and 5" });

    const existing = idea.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (existing) {
      existing.score = score;
    } else {
      idea.ratings.push({ user: req.user._id, score });
    }

    await idea.save();
    await idea.populate("author", "name avatar");
    await idea.populate("collaborators", "name avatar");
    res.json({ success: true, data: idea });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
