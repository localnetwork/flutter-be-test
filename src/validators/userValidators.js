const {
  emailValidator,
  addError,
  validateRequiredField,
} = require("../lib/helper");
const { findUserByEmail } = require("../entities/userEntity");
const { query } = require("../config/db");
const bcrypt = require("bcrypt");

// User registration validation
const userCreateValidation = async (req, res, next) => {
  const errors = [];
  const {
    email,
    password,
    confirm_password,
    gender,
    purok,
    birthday,
    first_name,
    middle_name,
    last_name,
  } = req.body;

  // Helper function to validate required fields

  // Validate required fields
  validateRequiredField(email, "email", "Email is required.", errors);
  validateRequiredField(gender, "gender", "Gender is required.", errors);
  validateRequiredField(purok, "purok", "Purok is required.", errors);
  validateRequiredField(
    birthday,
    "birthday",
    "Date of birth is required.",
    errors
  );
  validateRequiredField(password, "password", "Password is required.", errors);
  validateRequiredField(
    first_name,
    "first_name",
    "First name is required.",
    errors
  );
  validateRequiredField(
    middle_name,
    "middle_name",
    "Middle name is required.",
    errors
  );
  validateRequiredField(
    last_name,
    "last_name",
    "Last name is required.",
    errors
  );
  validateRequiredField(
    confirm_password,
    "confirm_password",
    "Confirm password is required.",
    errors
  );

  // Additional validations
  if (email) {
    if (await findUserByEmail(email)) {
      addError(errors, "email", "Email already exists.");
    } else if (!emailValidator(email)) {
      addError(errors, "email", "Email is invalid.");
    }
  }

  if (password && confirm_password && password !== confirm_password) {
    addError(errors, "password", "Password does not match.");
    addError(errors, "confirm_password", "Confirm password does not match.");
  }

  // Return errors if validation fails
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

  // Validate required fields
  validateRequiredField(email, "email", "Email is required.", errors);
  validateRequiredField(password, "password", "Password is required.", errors);

  // Validate email format if provided
  if (email && !emailValidator(email)) {
    addError(errors, "email", "Email is invalid.");
  }

  // Check user existence and credentials if both email and password are provided
  if (email && password && errors.length === 0) {
    const foundUser = await findUserByEmail(email);

    if (!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
      addError(errors, "email", invalidCredentialsMsg);
      addError(errors, "password", invalidCredentialsMsg);
    }
  }

  // Return errors if validation fails
  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

const updateUserValidator = async (req, res, next) => {
  const { first_name, middle_name, last_name, birthday, purok, email } =
    req.body;
  let errors = [];

  validateRequiredField(
    first_name,
    "first_name",
    "First Name is required.",
    errors
  );
  validateRequiredField(
    middle_name,
    "middle_name",
    "Middle Name is required.",
    errors
  );

  validateRequiredField(
    last_name,
    "last_name",
    "last Name is required.",
    errors
  );

  validateRequiredField(birthday, "birthday", "Birthday is required.", errors);
  validateRequiredField(purok, "purok", "Purok is required.", errors);

  const userResults = await query({
    sql: "SELECT * FROM users WHERE id = ?",
    values: parseInt(req.params.id),
  });

  if (userResults.length === 0) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }
  next();
};

const userArchiveValidator = async (req, res, next) => {
  const { id } = req.params;
  const [checkUser] = await query({
    sql: "SELECT * FROM users WHERE id = ?",
    values: [id],
  });

  if (checkUser?.status === 0) {
    return res.status(422).json({
      message: "User is already archived",
    });
  }
  next();
};

const userUnarchiveValidator = async (req, res, next) => {
  const { id } = req.params;
  const [checkUser] = await query({
    sql: "SELECT * FROM users WHERE id = ?",
    values: [id],
  });

  if (!checkUser) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  if (checkUser?.status === 1) {
    return res.status(422).json({
      message: "User is already active.",
    });
  }
  next();
};

const userDeleteValidator = async (req, res, next) => {
  const { id } = req.params;
  const [checkUser] = await query({
    sql: "SELECT * FROM users WHERE id = ?",
    values: [id],
  });

  if (!checkUser) {
    return res.status(404).json({
      message: "User doesn't exist.",
    });
  }

  if (checkUser?.role === 1) {
    return res.status(422).json({
      message: "Admin account cannot be deleted.",
    });
  }

  next();
};

module.exports = {
  userCreateValidation,
  userLoginValidation,
  updateUserValidator,
  userArchiveValidator,
  userUnarchiveValidator,
  userDeleteValidator,
};
