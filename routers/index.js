// routers/index.js
const express = require('express');
const homeRouter = require('./home.routes');
const postRouter = require('./post.routes');
const userRouter = require('./user.routes');
const router = express.Router();
const upload = require('../middlewares/upload');
const { isAuth } = require('../middlewares/auth');
const userController = require('../controllers/userController');
const authorRouter = require('./author.routes');


// Home routes (includes / and /blog)
router.use('/', homeRouter);

// Post routes
router.use('/posts', postRouter);

// User routes
router.use('/user', userRouter);

router.use('/author', authorRouter);

// Profile routes
router.get('/profile', isAuth, userController.profilePage);
router.get('/profile/edit', isAuth, userController.editProfileForm);
router.post('/profile/edit', isAuth, userController.updateProfile);

// Avatar Upload
router.post('/profile/avatar', isAuth, upload.single('avatar'), userController.updateAvatar);

// Delete Profile
router.post('/profile/delete', isAuth, userController.deleteProfile);

module.exports = router;
