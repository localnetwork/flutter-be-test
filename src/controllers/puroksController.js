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

const getPurokPopulation = async (req, res, next) => {
  const { purokId } = req.params;

  try {
    let population;
    if (purokId === "all") {
      [population] = await query({
        sql: `
          SELECT 
            COALESCE(SUM(p.male_population), 0) AS male_population,
            COALESCE(SUM(p.female_population), 0) AS female_population,
            COALESCE(SUM(p.male_population + p.female_population), 0) AS total_population,
            COALESCE(COUNT(u.id), 0) AS registered_users,
            COALESCE(COUNT(CASE WHEN u.verified = 1 AND u.status = 1 THEN 1 END), 0) AS active_users,
            COALESCE(COUNT(CASE WHEN u.gender = 1 THEN 1 END), 0) AS male_registered_users,
            COALESCE(COUNT(CASE WHEN u.gender = 2 THEN 1 END), 0) AS female_registered_users
          FROM 
            purok p
          LEFT JOIN 
            users u ON p.id = u.purok
        `,
      });
    } else {
      [population] = await query({
        sql: `
          SELECT 
            COALESCE(p.male_population, 0) AS male_population,
            COALESCE(p.female_population, 0) AS female_population,
            COALESCE(p.male_population + p.female_population, 0) AS total_population,
            COALESCE(COUNT(u.id), 0) AS registered_users,
            COALESCE(COUNT(CASE WHEN u.verified = 1 AND u.status = 1 THEN 1 END), 0) AS active_users,
            COALESCE(COUNT(CASE WHEN u.gender = 1 THEN 1 END), 0) AS male_registered_users,
            COALESCE(COUNT(CASE WHEN u.gender = 2 THEN 1 END), 0) AS female_registered_users
          FROM 
            purok p
          LEFT JOIN 
            users u ON p.id = u.purok
          WHERE 
            p.id = ?
        `,
        values: [purokId],
      });
    }

    return res.status(200).json(population);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { getPuroks, getPurokPopulation };
