const { query } = require("../config/db");
const bcrypt = require("bcrypt");
const { hidSensitiveData, currentTimestamp } = require("../lib/helper");
const saltRounds = 10;
require("dotenv").config();

const jwt = require("jsonwebtoken");

const userCreate = async (req, res) => {
  const {
    email,
    password,
    gender,
    purok,
    birthday,
    first_name,
    middle_name,
    last_name,
  } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const getTimestamp = currentTimestamp();

  try {
    const results = await query({
      sql: "INSERT INTO users (email, password, gender, purok, birthday, first_name, middle_name, last_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      values: [
        email,
        hashedPassword,
        gender,
        purok,
        birthday,
        first_name,
        middle_name,
        last_name,
        getTimestamp,
      ],
    });

    const getLatestUser = await query({
      sql: "SELECT * FROM users WHERE id = ?",
      values: results.insertId,
    });

    const token = jwt.sign(
      {
        userId: getLatestUser[0].id,
        email: getLatestUser[0].email,
        role: getLatestUser[0].role,
      },
      process.env.NODE_JWT_SECRET
      // { expiresIn: '1h' } // Example: token expires in 1 hour
    );

    return res.status(200).json({
      message: "User created successfully",
      data: hidSensitiveData(getLatestUser[0]),
      token: token,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "Server Error",
      error: error,
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const results = await query({
      sql: "SELECT * FROM users WHERE email = ?",
      values: req.body.email,
    });
    const token = jwt.sign(
      {
        userId: results[0].id,
        email: results[0].email,
        role: results[0].role,
      },
      process.env.NODE_JWT_SECRET
      // { expiresIn: '1h' } // Example: token expires in 1 hour
    );
    return res.status(200).json({
      message: "User logged in successfully",
      data: hidSensitiveData(results[0]),
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const userProfile = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.decode(token);

  try {
    const userResults = await query({
      sql: "SELECT * FROM users WHERE id = ?",
      values: decoded.userId,
    });

    const eventsResults = await query({
      sql: "SELECT * FROM events_participation WHERE user_id = ? AND status = 'attended'",
      values: decoded.userId,
    });

    const user = hidSensitiveData(userResults[0]);
    user.attendedEventsCount = eventsResults.length;

    return res.status(200).json({
      message: "User profile",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const joinEvent = async (req, res, next) => {
  const id = parseInt(req.params.id);

  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const created_at = currentTimestamp();
  try {
    // Check if the event is upcoming
    const event = await query({
      sql: "SELECT * FROM events WHERE id = ? AND event_start_datetime > NOW()",
      values: [id],
    });

    if (event.length === 0) {
      return res.status(400).json({
        message: "Cannot join past or ongoing events.",
      });
    }

    // Check if the user has already joined the event
    const existingRecord = await query({
      sql: "SELECT * FROM events_participation WHERE event_joined = ? AND user_id = ?",
      values: [id, decoded?.userId],
    });

    if (existingRecord.length > 0) {
      return res.status(400).json({
        message: "You already joined this event.",
      });
    }

    // Insert new participation record
    const results = await query({
      sql: "INSERT INTO events_participation (event_joined, user_id, created_at, status) VALUES (?, ?, ?, ?)",
      values: [id, decoded?.userId, created_at, "partial"],
    });

    return res.status(200).json({
      message: "Successfully joined the event",
    });
  } catch (error) {
    console.error("Error joining event:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const redeemCodeValidator = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const msgInvalid = "Invalid code.";
  const { code } = req.body;
  let errors = [];

  validateRequiredField(code, "code", "Code is required.", errors);

  try {
    const results = await query({
      sql: "SELECT * FROM generated_codes WHERE code = ?",
      values: code,
    });

    if (results.length === 0) {
      errors.push({ code: msgInvalid });
    } else {
      if (results[0].status === "redeemed") {
        errors.push({ code: "Code already redeemed." });
      }
      if (decoded?.userId !== results[0].code_owner) {
        errors.push({ code: "Only owner can redeem this code." });
      }
    }

    if (errors.length > 0) {
      return res.status(422).json({
        message: "Validation failed. Please check the errors.",
        errors,
      });
    }

    next();
  } catch (error) {
    console.error("Error validating code:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { userCreate, userLogin, userProfile, joinEvent };
