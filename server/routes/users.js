const express = require("express");
const router = express.Router();

/**
 * Optional auth middleware
 * No JWT enforcement yet (guest-first SaaS)
 */
function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    req.user = { id: token }; // future JWT support
  } catch {
    req.user = null;
  }

  next();
}

/**
 * GET /users/me
 * REQUIRED by frontend
 */
router.get("/me", authOptional, async (req, res) => {
  try {
    // Guest user (default)
    if (!req.user) {
      return res.json({
        id: "guest",
        email: null,
        role: "guest",
        credits: 0,
      });
    }

    // Authenticated user (future-ready)
    let User;
    try {
      User = require("../models/User");
    } catch {
      return res.json({
        id: "guest",
        email: null,
        role: "guest",
        credits: 0,
      });
    }

    const user = await User.findById(req.user.id).select(
      "_id email role credits"
    );

    if (!user) {
      return res.json({
        id: "guest",
        email: null,
        role: "guest",
        credits: 0,
      });
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      credits: user.credits,
    });
  } catch (err) {
    console.error("❌ /users/me error:", err);
    res.status(500).json({ error: "Failed to load user profile" });
  }
});

module.exports = router;
