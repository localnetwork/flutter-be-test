const { query } = require("../config/db");
const { hidSensitiveData } = require("../lib/helper");
const findUserByEmail = async (email) => {
  const results = await query({
    sql: "SELECT * FROM users WHERE email = ?",
    values: email,
  });

  if (results.length === 0) {
    return false;
  }

  return results[0];
};

const findUserById = async (id) => {
  const userId = parseInt(id);
  const results = await query({
    sql: "SELECT * FROM users",
    values: [userId],
  });
  return hidSensitiveData(results[0]);
};

module.exports = { findUserByEmail, findUserById };
