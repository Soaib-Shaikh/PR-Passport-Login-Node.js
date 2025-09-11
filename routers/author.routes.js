const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

// Route: /author/:id → show all posts by this author
router.get('/:id', authorController.authorPosts);

module.exports = router;
