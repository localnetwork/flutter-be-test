const { query } = require("../config/db");
const { hidSensitiveData } = require("../helpers/helper");
const findUserByEmail = async (email) => {
  const results = await query({
    sql: "SELECT * FROM users WHERE email = ?",
    values: email,
  });

  if (results.length === 0) {
    return false;
  }

  return true;
};

const findUserById = async (id) => {
  const results = await query({
    sql: "SELECT * FROM users WHERE id = ?",
    values: id,
  });

  return hidSensitiveData(results[0]);
};

module.exports = { findUserByEmail, findUserById };
