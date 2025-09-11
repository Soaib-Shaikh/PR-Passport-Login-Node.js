// controllers/authorController.js
const Post = require('../models/Post');
const User = require('../models/userSchema');

exports.authorPosts = async (req, res) => {
  try {
    //  Fetch author
    const author = await User.findById(req.params.id).lean();
    if (!author) return res.status(404).send("Author not found");

    //  Fetch all posts by this author
    const posts = await Post.find({ author: author._id })
      .populate('author', 'username avatarUrl bio')       // author info for display
      .sort({ createdAt: -1 })
      .lean();

    //  Popular posts (most liked, optional)
    const popularPosts = await Post.find()
      .populate('author', 'username')
      .sort({ likes: -1 })
      .limit(5)
      .lean();

    //  Recent comments (latest 5)
    let recentComments = [];
    posts.forEach(p => {
      p.comments.forEach(c => {
        recentComments.push({
          postId: p._id,
          postTitle: p.title,
          username: c.author?.username || "Anonymous",
          body: c.body,
          createdAt: c.createdAt
        });
      });
    });
    recentComments = recentComments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    // Render authorPosts EJS
    res.render('./pages/blog/authorPosts', {
      user: req.user,
      author,
      posts,
      popularPosts,
      recentComments
    });

  } catch (err) {
    console.error("Author posts load error:", err);
    res.status(500).send("Server Error");
  }
};
