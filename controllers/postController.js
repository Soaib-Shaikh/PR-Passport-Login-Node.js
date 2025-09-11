// controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/userSchema');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../configs/cloudinary');

// helper to delete local file
const deleteLocalFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(__dirname, '..', 'public', 'uploads', filename);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (err) { console.error("Local file delete error:", err); }
  }
};

// helper to upload to cloudinary
const uploadToCloudinary = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, { folder: "blogs" });
};

// Homepage / Category Feed
exports.feed = async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.redirect('/login');

    const user = req.user;
    const category = req.params.category; // optional

    // Filter posts by category if present
    let filter = {};
    if (category) filter.category = category;

    const posts = await Post.find(filter)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    const featuredPosts = await Post.find(filter)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(3);

    const popularPosts = await Post.find(filter)
      .populate('author', 'username')
      .sort({ likes: -1 })
      .limit(5);

    // Recent comments
    const recentComments = [];
    posts.forEach(p => {
      p.comments.forEach(c => {
        recentComments.push({
          postId: p._id,
          postTitle: p.title,
          author: c.author.username || 'Unknown',
          body: c.body,
          createdAt: c.createdAt
        });
      });
    });
    recentComments.sort((a,b) => b.createdAt - a.createdAt);
    const latestComments = recentComments.slice(0,5);

    res.render('./pages/blog/category', {
      user,
      posts,
      featuredPosts,
      popularPosts,
      recentComments: latestComments,
      category: category || 'All'
    });

  } catch(err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Show single post
exports.show = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email')
      .populate('comments.author', 'username');

    if (!post) return res.status(404).send('Post not found');

    res.render('./pages/blog/post', {
      post,
      user: req.user || null,
      me: req.user?._id
    });

  } catch (error) {
    console.error('⚠️ Error fetching post:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Create form
exports.createForm = (req, res) => {
  if (!req.session?.userId) return res.redirect('/login');
  res.render('./pages/writer/writerHome'); // form ejs will include category dropdown
};

// Create new post
exports.create = async (req, res) => {
  try {
    if (!req.user._id) return res.redirect('/login');

    const { title, body, category } = req.body;
    if (!title?.trim() || !body?.trim() || !category?.trim()) {
      return res.status(400).send('Title, body and category are required');
    }

    const post = new Post({
      title,
      body,
      category,
      author: req.user._id
    });

    if (req.file) {
      post.localPath = req.file.filename;
      const result = await uploadToCloudinary(req.file.path);
      post.coverUrl = result.secure_url;
      post.coverPublicId = result.public_id;
    }

    await post.save();
    console.log("Post Created.");
    return res.redirect('/blog');
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).send('Error creating post');
  }
};

// Edit form
exports.editForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author');
    if (!post) return res.status(404).send("Post not found");

    if (String(post.author._id) !== String(req.user._id)) {
        return res.status(403).send("Unauthorized");
    }

    const user = req.user._id ? await User.findById(req.user._id).lean() : null;
    res.render('pages/blog/editPost', { post, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Update post
exports.update = async (req, res) => {
  try {
    const postId = req.params.id;
    let post = await Post.findById(postId);
    if (!post) return res.status(404).send("Post not found");

    // Update fields including category
    post.title = req.body.title || post.title;
    post.body = req.body.body || post.body;
    post.category = req.body.category || post.category;

    if (req.file) {
      if (post.coverPublicId) {
        try { await cloudinary.uploader.destroy(post.coverPublicId); } catch (err) { console.error("Cloudinary destroy err:", err); }
      }
      if (post.localPath) deleteLocalFile(post.localPath);

      const result = await uploadToCloudinary(req.file.path);
      post.coverUrl = result.secure_url;
      post.coverPublicId = result.public_id;
      post.localPath = req.file.filename;
    }

    await post.save();
    console.log("Post updated successfully");
    res.redirect('/posts/' + post._id);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Something went wrong!");
  }
};

// Delete post
exports.delete = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");
    if (String(post.author) !== String(req.user._id)) return res.status(403).send("Unauthorized");

    if (post.coverPublicId) {
      try { await cloudinary.uploader.destroy(post.coverPublicId); } catch (err) { console.error("Cloudinary delete error:", err); }
    }
    if (post.localPath) deleteLocalFile(post.localPath);

    await Post.findByIdAndDelete(req.params.id);
    console.log('Post Deleted.');
    res.redirect('/blog');
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
};

// Toggle like
exports.toggleLike = async (req, res) => {
  try {
    if (!req.user._id) return res.redirect('/login');

    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect('/blog');

    const uid = req.user._id.toString();
    const index = post.likes.findIndex(like => like.toString() === uid);

    if (index >= 0) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(uid);
    }

    await post.save();
    return res.redirect('/posts/' + post._id);
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.redirect('/blog');
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    if (!req.user._id) return res.redirect('/login');

    const { body } = req.body;
    if (!body || !body.trim()) return res.redirect('/posts/' + req.params.id);

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { author: req.user._id, body: body.trim() } } },
      { new: true, runValidators: true }
    );

    if (!post) return res.redirect('/blog');

    return res.redirect('/posts/' + req.params.id);
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.redirect('/posts/' + req.params.id);
  }
};

// Search posts
exports.searchPost = async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) return res.render("./pages/blog/searchPost", { posts: [], query: "", user: req.user });

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { body: { $regex: query, $options: "i" } }
      ]
    }).populate("author", "username");

    res.render("./pages/blog/searchPost", { posts, query, user: req.user });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Server Error");
  }
};
