const { query } = require("../config/db");
const getPuroks = async (req, res, next) => {
  try {
    const results = await query({
      sql: "SELECT * FROM purok",
    });

    return res.status(200).json({
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { getPuroks };
