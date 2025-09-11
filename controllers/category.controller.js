// controllers/category.controller.js
const Post = require('../models/Post');

exports.categoryPosts = async (req, res) => {
  try {
    const category = req.params.category;

    // Only fetch posts for this category
    const posts = await Post.find({ category })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    // Featured posts (latest 3 in this category)
    const featuredPosts = await Post.find({ category })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(3);

    // Popular posts (most liked in this category)
    const popularPosts = await Post.find({ category })
      .populate('author', 'username')
      .sort({ likes: -1 })
      .limit(5);

    // Recent comments in this category
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
    recentComments.sort((a,b)=> b.createdAt - a.createdAt);
    const latestComments = recentComments.slice(0,5);

    res.render('./pages/blog/category', {
      category,
      posts,
      featuredPosts,
      popularPosts,
      recentComments: latestComments,
      user: req.user
    });
  } catch(err){
    console.error(err);
    res.status(500).send("Server Error");
  }
};
