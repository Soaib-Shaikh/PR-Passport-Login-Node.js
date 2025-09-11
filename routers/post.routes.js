const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { isAuth, allowUsers } = require('../middlewares/auth');
const ctrl = require('../controllers/postController');

// ===== BLOG HOME & CATEGORY =====
// Blog home (all posts)
router.get('/blog', isAuth, ctrl.feed);
router.get('/category/:category', isAuth, ctrl.feed);

// ===== SEARCH =====
router.get('/search', isAuth, ctrl.searchPost);

// ===== CREATE POST =====
router.get('/new', isAuth, ctrl.createForm);
router.post('/', isAuth, upload.single('cover'), ctrl.create);

// ===== READ SINGLE POST =====
router.get('/:id', allowUsers, ctrl.show);

// ===== DELETE POST =====
router.post('/delete/:id', isAuth, ctrl.delete);

// ===== EDIT POST =====
router.get('/edit/:id', isAuth, ctrl.editForm);
router.post('/edit/:id', isAuth, upload.single('cover'), ctrl.update);

// ===== SOCIAL INTERACTIONS =====
router.post('/:id/like', isAuth, ctrl.toggleLike);
router.post('/:id/comments', isAuth, ctrl.addComment);

module.exports = router;
