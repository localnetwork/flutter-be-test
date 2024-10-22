const express = require("express");
const { isLoggedIn } = require("../middlewares/auth");

const { createBlogValidation } = require("../validators/blogValidators");
const { createBlog, getBlogs } = require("../controllers/blogsController");
const router = express.Router();

router.post("/blogs", isLoggedIn, createBlogValidation, createBlog);
router.get("/blogs", isLoggedIn, getBlogs);

module.exports = router;
