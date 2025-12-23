// server/routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// ==========================================================
// CREATE POST
// ==========================================================
router.post('/', async (req, res) => {
  try {
    const payload = req.body;

    // Validate caption
    if (!payload.caption || typeof payload.caption !== 'string') {
      return res.status(400).json({ error: 'caption is required' });
    }

    const post = new Post({
      caption: payload.caption,
      image: payload.image || '',
      platforms: Array.isArray(payload.platforms)
        ? payload.platforms
        : (payload.platforms
            ? String(payload.platforms)
                .split(',')
                .map((s) => s.trim())
            : []),
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
      status: payload.status || 'draft',
      author: payload.author || 'MobileUser',
      meta: payload.meta || {}
    });

    await post.save();

    return res.status(201).json(post);

  } catch (err) {
    console.error("POST /api/posts ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// LIST POSTS (with pagination, filters, search)
// ==========================================================
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const per = Math.max(1, Math.min(100, parseInt(req.query.per || '20')));
    const status = req.query.status;
    const q = req.query.q;

    const filter = {};
    if (status) filter.status = status;
    if (q) filter.caption = { $regex: q, $options: 'i' };

    const total = await Post.countDocuments(filter);

    const docs = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per);

    return res.json({ data: docs, page, per, total });

  } catch (err) {
    console.error("GET /api/posts ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// GET SINGLE POST
// ==========================================================
router.get('/:id', async (req, res) => {
  try {
    const doc = await Post.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    return res.json(doc);

  } catch (err) {
    console.error("GET /api/posts/:id ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================================
// UPDATE POST
// ==========================================================
router.put('/:id', async (req, res) => {
  try {
    const payload = req.body;
    const update = {};

    if (payload.caption !== undefined) update.caption = payload.caption;
    if (payload.image !== undefined) update.image = payload.image;
    if (payload.platforms !== undefined) {
      update.platforms = Array.isArray(payload.platforms)
        ? payload.platforms
        : String(payload.platforms).split(',').map((s) => s.trim());
    }
    if (payload.scheduledAt !== undefined)
      update.scheduledAt = payload.scheduledAt ? new Date(payload.scheduledAt) : null;

    if (payload.status !== undefined) update.status = payload.status;
    if (payload.meta !== undefined) update.meta = payload.meta;
    if (payload.likes !== undefined) update.likes = payload.likes;
    if (payload.comments !== undefined) update.comments = payload.comments;
    if (payload.shares !== undefined) update.shares = payload.shares;

    update.updatedAt = new Date();

    const doc = await Post.findByIdAndUpdate(req.params.id, update, { new: true });

    return res.json(doc);

  } catch (err) {
    console.error("PUT /api/posts/:id ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================================
// DELETE POST
// ==========================================================
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });

  } catch (err) {
    console.error("DELETE /api/posts/:id ERROR:", err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
