const express = require("express");
const { isLoggedIn, isAdmin } = require("../middlewares/auth");

const { eventCreateValidator } = require("../validators/eventValidators");
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

router.get("/member-events", isLoggedIn);

router.post(
  "/events",
  isAdmin,
  upload.single("image"),
  eventCreateValidator,
  (req, res) => {
    res.json({ message: "Event added." });
  }
);

module.exports = router;
