const express = require("express");
const router = express.Router();

const { userCreate, userLogin } = require("../controllers/usersController");
const {
  userCreateValidation,
  userLoginValidation,
} = require("../validators/userValidators");

router.post("/register", userCreateValidation, userCreate);
router.post("/login", userLoginValidation, userLogin);

module.exports = router;
