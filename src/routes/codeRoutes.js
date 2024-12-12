const express = require("express");
const router = express.Router();

const { isLoggedIn, isMember } = require("../middlewares/auth");

const { redeemCodeValidator } = require("../validators/codeValidator");

const { redeemCode } = require("../controllers/codesController");

router.post(
  "/code/redeem",
  isLoggedIn,
  isMember,
  redeemCodeValidator,
  redeemCode
);

module.exports = router;
