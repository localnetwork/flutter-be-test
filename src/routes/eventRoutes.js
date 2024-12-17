const express = require("express");
const {
  isLoggedIn,
  isAdmin,
  isApproved,
  isVerified,
} = require("../middlewares/auth");
const {
  addEvent,
  getMemberEvents,
  joinEvent,
  getEventParticipants,
  eventAttendanceApproval,
  getUserAttendedEvents,
  getEventStat,
} = require("../controllers/eventsController");
const {
  eventCreateValidator,
  eventAttendanceApprovalValidator,
  joinEventValidator,
} = require("../validators/eventValidators");

const router = express.Router();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/events"); // Destination folder
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + Date.now() + extension); // Unique file name with original extension
  },
});

const upload = multer({ storage: storage });

router.get("/member-events", isLoggedIn, getMemberEvents);

router.post(
  "/member-events/:id/join",
  isLoggedIn,
  isVerified,
  isApproved,
  joinEventValidator,
  joinEvent
);

router.post(
  "/events",
  isAdmin,
  upload.single("image"),
  eventCreateValidator,
  addEvent
);

router.get("/member-events/:id/participants", isAdmin, getEventParticipants);

// router.get("/member-events/attended", isLoggedIn, getUserAttendedEvents);

router.post(
  "/member-events/:id/approval/:userId",
  isAdmin,
  eventAttendanceApprovalValidator,
  eventAttendanceApproval
);

router.get("/member-events/:id/statistics", isAdmin, getEventStat);

module.exports = router;
