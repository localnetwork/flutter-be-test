const express = require("express");
const { isLoggedIn } = require("../middlewares/auth");
const router = express.Router();

router.post("/notifications", isLoggedIn);

module.exports = router;
