const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { isAuth } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Profile Routes
router.get("/profile", isAuth, userController.profilePage);
router.get("/profile/edit", isAuth, userController.editProfileForm);
router.post("/profile/edit", isAuth, userController.updateProfile);

// Avatar Upload Route
router.post("/profile/avatar", isAuth, upload.single("avatar"), userController.updateAvatar);

router.post("/profile/delete", isAuth, userController.deleteProfile);

module.exports = router;
