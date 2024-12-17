const express = require("express");
const router = express.Router();

const {
  userCreate,
  userLogin,
  userProfile,
  getUsers,
  updateUser,
  getUser,
} = require("../controllers/usersController");
const {
  userCreateValidation,
  userLoginValidation,
  updateUserValidator,
} = require("../validators/userValidators");

const { ageValidator } = require("../middlewares/age");

const { isLoggedIn, isAdmin } = require("../middlewares/auth");

router.post("/register", userCreateValidation, userCreate);
router.post("/login", userLoginValidation, userLogin);
router.get("/profile", isLoggedIn, userProfile);
router.get("/users", isAdmin, getUsers);
router.put("/user/:id", isAdmin, updateUserValidator, updateUser);
router.get("/user/:id", isAdmin, getUser);

module.exports = router;
