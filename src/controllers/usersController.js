const { query } = require("../config/db");
const bcrypt = require("bcrypt");
const { hidSensitiveData } = require("../helpers/helper");
const saltRounds = 10;

const userCreate = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const results = query({
      sql: "INSERT INTO users (email, password) VALUES (?, ?)",
      values: [email, hashedPassword],
    });

    return res.status(200).json({
      message: "User created successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const results = await query({
      sql: "SELECT * FROM users WHERE email = ?",
      values: req.body.email,
    });

    console.log("results", results);

    return res.status(200).json({
      message: "User logged in successfully",
      data: hidSensitiveData(results[0]),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { userCreate, userLogin };
