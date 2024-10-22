const { query } = require("../config/db");
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

module.exports = { findUserByEmail };
