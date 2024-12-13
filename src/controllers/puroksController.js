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
      const [total] = await query({
        sql: `SELECT
        SUM(male_population) AS male_population,
        SUM(female_population) AS female_population,
        SUM(male_population + female_population) AS total_population
      FROM purok`,
      });
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
      population.total_population = total.total_population;
      population.male_population = total.male_population;
      population.female_population = total.female_population;
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
