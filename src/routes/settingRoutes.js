const express = require("express");
const router = express.Router();

const { isAdmin } = require("../middlewares/auth");
const {
  updateRewardCountSettings,
  getSettings,
} = require("../controllers/settingsController");

router.put("/settings/reward-count", isAdmin, updateRewardCountSettings);
router.get("/settings", isAdmin, getSettings);

module.exports = router;
