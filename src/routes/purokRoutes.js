const express = require("express");
const router = express.Router();
const { getPuroks } = require("../controllers/puroksController");
router.get("/purok", getPuroks);

module.exports = router;
