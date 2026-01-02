// server/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    caption: { type: String, required: true },
    image: { type: String, default: '' },
    platforms: { type: [String], default: [] },
    scheduledAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
    },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    author: { type: String, default: 'MobileUser' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
