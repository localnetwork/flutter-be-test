const { query } = require("../config/db");
const getSettings = async (req, res) => {
  try {
    const [getPopulation] = await query({
      sql: `
        SELECT 
          SUM(male_population) AS total_male_population, 
          SUM(female_population) AS total_female_population,
          SUM(male_population + female_population) AS total_population
        FROM purok
      `,
    });
    const [results] = await query({
      sql: "SELECT * FROM settings",
    });
    const [getRegisteredUsers] = await query({
      sql: "SELECT COUNT(*) AS count FROM users",
    });
    results.total_registered_users = getRegisteredUsers.count;
    results.population = getPopulation;

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
