const express = require('express');
const homeRouter = require('./home.routes');
const postRouter = require('./post.routes');
const userRouter = require('./user.routes');
const router = express.Router();
const upload = require('../middlewares/upload');
const { isAuth } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Existing routes
router.use('/', homeRouter);
router.use('/posts', postRouter);
router.use('/user', userRouter);

// Profile routes
router.get('/profile', isAuth, userController.profilePage);
router.get('/profile/edit', isAuth, userController.editProfileForm);
router.post('/profile/edit', isAuth, userController.updateProfile);

// Avatar Upload
router.post('/profile/avatar', isAuth, upload.single('avatar'), userController.updateAvatar);

// Delete Profile
router.post('/profile/delete', isAuth, userController.deleteProfile);

module.exports = router;
