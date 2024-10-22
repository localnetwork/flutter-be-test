const { emailValidator } = require("../helpers/helper");
const { findUserByEmail } = require("../entities/userEntity");
const { query } = require("../config/db");
const bcrypt = require("bcrypt");
const userCreateValidation = async (req, res, next) => {
  const errors = [];

  const foundUser = await findUserByEmail(req.body.email);

  const { email, password } = req.body;

  if (foundUser) {
    errors.push({
      email: "Account already exists.",
    });
    errors.push({
      password: "Account already exists.",
    });
  }

  if (!email) {
    errors.push({
      email: "Email is required",
    });
  }

  if (emailValidator(email) === false && email) {
    errors.push({
      email: "Email is invalid",
    });
  }

  if (!password) {
    errors.push({
      password: "Password is required",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Please check the errors in the fields.",
      errors: errors,
    });
  }

  next();
};

// User login validation

const userLoginValidation = async (req, res, next) => {
  const { email, password } = req.body;

  const invalidCredentialsMsg = "These credentials do not match our records.";

  const errors = [];

  if (!email) {
    errors.push({
      email: "Email is required",
    });
  }

  if (emailValidator(email) === false && email) {
    errors.push({
      email: "Email is invalid",
    });
  }

  if (!password) {
    errors.push({
      password: "Password is required",
    });
  }

  const foundUser = await findUserByEmail(email);

  if (!foundUser) {
    errors.push({
      email: invalidCredentialsMsg,
    });
    errors.push({
      password: invalidCredentialsMsg,
    });
  }

  const results = await query({
    sql: "SELECT * FROM users WHERE email = ?",
    values: email,
  });

  const passwordMatch = await bcrypt.compare(password, results[0].password);

  if (!passwordMatch) {
    errors.push({
      email: invalidCredentialsMsg,
    });
    errors.push({
      password: invalidCredentialsMsg,
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Please check the errors in the fields.",
      errors: errors,
    });
  }

  next();
};

module.exports = { userCreateValidation, userLoginValidation };
