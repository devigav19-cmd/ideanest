const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper — generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// ── POST /api/auth/register ────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check duplicate email
    const exists = await User.scope("withPassword").findOne({ where: { email } });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "creator",
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────
exports.getMe = async (req, res) => {
  const u = req.user.get({ plain: true });
  u._id = u.id;
  res.json({ success: true, user: u });
};
