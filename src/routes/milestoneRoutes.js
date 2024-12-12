const express = require("express");

const router = express.Router();
const {
  milestoneCreateValidator,
} = require("../validators/milestoneValidators");

const {
  updateMilestones,
  getThresholds,
} = require("../controllers/milestoneController");
const { isAdmin, isLoggedIn } = require("../middlewares/auth");

router.put("/milestones/thresholds", isAdmin, updateMilestones);

router.get("/milestones/thresholds", isLoggedIn, getThresholds);

module.exports = router;
