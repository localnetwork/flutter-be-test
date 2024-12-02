const { emailValidator } = require("../lib/helper");
const { findUserByEmail } = require("../entities/userEntity");
const { query } = require("../config/db");
const bcrypt = require("bcrypt");

// Helper function for adding errors
const addError = (errors, field, message) => {
  errors.push({ [field]: message });
};

// User registration validation
const userCreateValidation = async (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  // Check if email is provided and valid
  if (!email) {
    addError(errors, "email", "Email is required");
  } else if (!emailValidator(email)) {
    addError(errors, "email", "Email is invalid");
  }

  // Check if password is provided
  if (!password) {
    addError(errors, "password", "Password is required");
  }

  // Check if user already exists
  if (email && (await findUserByEmail(email))) {
    addError(errors, "email", "Account already exists");
    addError(errors, "password", "Account already exists");
  }

  // If errors exist, return early
  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

// User login validation
const userLoginValidation = async (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;
  const invalidCredentialsMsg = "These credentials do not match our records.";

  // Validate email
  if (!email) {
    addError(errors, "email", "Email is required");
  } else if (!emailValidator(email)) {
    addError(errors, "email", "Email is invalid");
  }

  // Validate password
  if (!password) {
    addError(errors, "password", "Password is required");
  }

  // Check user existence and credentials if email and password are provided
  if (email && password) {
    const foundUser = await findUserByEmail(email);

    if (!foundUser) {
      addError(errors, "email", invalidCredentialsMsg);
      addError(errors, "password", invalidCredentialsMsg);
    } else {
      const passwordMatch = await bcrypt.compare(password, foundUser.password);
      if (!passwordMatch) {
        addError(errors, "email", invalidCredentialsMsg);
        addError(errors, "password", invalidCredentialsMsg);
      }
    }
  }

  // If errors exist, return early
  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

module.exports = { userCreateValidation, userLoginValidation };
