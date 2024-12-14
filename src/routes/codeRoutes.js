const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  isMember,
  isVerified,
  isApproved,
} = require("../middlewares/auth");

const { redeemCodeValidator } = require("../validators/codeValidator");

const { redeemCode } = require("../controllers/codesController");

router.post(
  "/code/redeem",
  isLoggedIn,
  isMember,
  isVerified,
  isApproved,
  redeemCodeValidator,
  redeemCode
);

module.exports = router;
