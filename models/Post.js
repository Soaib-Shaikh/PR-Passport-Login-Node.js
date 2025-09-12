const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  body:     { type: String, required: true, trim: true },
  createdAt:{ type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  body:    { type: String, required: true },
  category: { type: String, enum: ['tech','lifestyle','travel'], default: 'tech' },
  coverUrl: String,
  coverPublicId: String,
  localPath: String,
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  comments:[commentSchema],
}, { timestamps: true });

// ✅ OverwriteModelError fix
module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
