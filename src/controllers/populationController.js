const { query } = require("../config/db");

const getPopulation = async (req, res, next) => {
  try {
    const [population] = await query({
      sql: `
        SELECT 
          COUNT(*) AS registered_users,
          COUNT(CASE WHEN gender = 1 THEN 1 END) AS male_users,
          COUNT(CASE WHEN gender = 2 THEN 1 END) AS female_users,
          COUNT(CASE WHEN verified = 1 AND status = 1 THEN 1 END) AS active_users
        FROM 
          users
      `,
    });

    return res.status(200).json(population);
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getPopulation };
