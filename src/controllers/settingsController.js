const { query } = require("../config/db");
const getSettings = async (req, res) => {
  try {
    const [results] = await query({
      sql: "SELECT * FROM settings",
    });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateRewardCountSettings = async (req, res) => {
  const { rewardsCount } = req.body;
  try {
    await query({
      sql: "UPDATE settings SET rewards_number = ?",
      values: [rewardsCount],
    });

    return res.status(200).json({
      message: "Settings updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { getSettings, updateRewardCountSettings };
