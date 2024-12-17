const express = require("express");
const router = express.Router();
const { getTokenValidator } = require("../validators/tokenValidators");

const { getToken } = require("../controllers/tokensController");
router.get("/token/:token", getTokenValidator, getToken);

module.exports = router;
