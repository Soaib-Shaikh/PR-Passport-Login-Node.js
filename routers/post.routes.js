const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { isAuth, allowUsers } = require('../middlewares/auth');
const ctrl = require('../controllers/postController');

// 1) Search (static route) MUST come before dynamic ':id'
router.get('/search', isAuth, ctrl.searchPost);

// 2) Routes related to creating a post
router.get('/new', isAuth, ctrl.createForm);
router.post('/', isAuth, upload.single('cover'), ctrl.create);

// 3) Read single post (dynamic route)
router.get('/:id', allowUsers, ctrl.show);

// 4) Delete Post
router.post('/delete/:id', isAuth, ctrl.delete);

// 5) Edit Post form
router.get('/edit/:id', isAuth, ctrl.editForm);

// 6) Update Post
router.post('/edit/:id', isAuth, upload.single('cover'), ctrl.update);

// 7) Social interactions
router.post('/:id/like', isAuth, ctrl.toggleLike);
router.post('/:id/comments', isAuth, ctrl.addComment);

module.exports = router;
