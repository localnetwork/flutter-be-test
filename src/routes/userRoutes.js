const express = require("express");
const router = express.Router();

const {
  userCreate,
  userLogin,
  userProfile,
} = require("../controllers/usersController");
const {
  userCreateValidation,
  userLoginValidation,
} = require("../validators/userValidators");

const { ageValidator } = require("../middlewares/age");

const { isLoggedIn } = require("../middlewares/auth");

router.post("/register", userCreateValidation, userCreate);
router.post("/login", userLoginValidation, userLogin);
router.get("/profile", isLoggedIn, userProfile);

module.exports = router;
