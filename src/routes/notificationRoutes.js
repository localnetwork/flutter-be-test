const express = require("express");
const { isLoggedIn } = require("../middlewares/auth");
const router = express.Router();
const {
  getNotifications,
  updateNotification,
  updateNotificationRead,
} = require("../controllers/notificationsController");

// const {
//   createNotificationValidator,
// } = require("../validators/notificationValidators");
// ``;
// router.post("/notifications", isLoggedIn, createNotificationValidator);

const {
  updateNotificationReadValidator,
  updateNotificationValidator,
} = require("../validators/notificationValidators");
router.get("/notifications", isLoggedIn, getNotifications);

router.put(
  "/notifications/:id",
  isLoggedIn,
  updateNotificationValidator,
  updateNotification
);

router.put(
  "/notifications/:id/read",
  isLoggedIn,
  updateNotificationReadValidator,
  updateNotificationRead
);

module.exports = router;
