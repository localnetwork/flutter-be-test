const express = require("express");
const router = express.Router();

const { isLoggedIn, isMember, isAdmin } = require("../middlewares/auth");
const {
  createRewardValidator,
  rewardClaimValidator,
} = require("../validators/rewardValidators");
const {
  addReward,
  getRewards,
  claimableRewards,
  claimReward,
} = require("../controllers/rewardsController");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/rewards"); // Destination folder
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + Date.now() + extension); // Unique file name with original extension
  },
});

const upload = multer({ storage: storage });

router.post(
  "/rewards/claim",
  isLoggedIn,
  isMember,
  rewardClaimValidator,
  claimReward
);

router.get("/reward/claimable", isLoggedIn, isMember, claimableRewards);

router.post(
  "/rewards",
  isAdmin,
  upload.single("image"),
  createRewardValidator,
  addReward
);

router.get("/rewards", isLoggedIn, getRewards);

module.exports = router;
