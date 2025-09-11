const { Router } = require("express");

const router = Router();

const { categoryPosts } = require("../controllers/category.controller");

router.get('/:category', categoryPosts)

module.exports = router;