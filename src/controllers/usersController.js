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
    const results = await query({
      sql: "SELECT * FROM users WHERE id = ?",
      values: decoded.userId,
    });

    return res.status(200).json({
      message: "User profile",
      data: hidSensitiveData(results[0]),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { userCreate, userLogin, userProfile };
