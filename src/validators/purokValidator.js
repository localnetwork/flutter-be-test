const { validateRequiredField } = require("../lib/helper");
const { query } = require("../config/db");
const purokUpdateValidator = async (req, res, next) => {
  const { id } = req.params;
  const { name, male_population, female_population } = req.body;

  const errors = [];
  // Validate required fields
  validateRequiredField(name, "name", "Purok Name is required.", errors);

  const [maleCount] = await query({
    sql: "SELECT COUNT(*) as count FROM users WHERE gender = 1 AND purok = ?",
    values: [id],
  });

  const [femaleCount] = await query({
    sql: "SELECT COUNT(*) as count FROM users WHERE gender = 2 AND purok = ?",
    values: [id],
  });

  if (male_population < maleCount?.count) {
    errors.push({
      male_population:
        "Male population should not be less than registered male users in the purok.",
    });
  }
  if (female_population < femaleCount?.count) {
    errors.push({
      female_population:
        "Female population should not be less than registered female users in the purok.",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

module.exports = { purokUpdateValidator };
