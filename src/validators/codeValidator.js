const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { validateRequiredField } = require("../lib/helper");

const redeemCodeValidator = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")?.[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token is missing." });
    }

    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token." });
    }

    const { code } = req.body;
    const errors = [];

    // Validate code field
    validateRequiredField(code, "code", "Code is required.", errors);
    if (errors.length > 0) {
      return res.status(422).json({
        message: "Validation failed. Please check the errors.",
        errors,
      });
    }

    // Query database for the code
    const [result] = await query({
      sql: "SELECT * FROM generated_codes WHERE code = ?",
      values: [code],
    });

    const [results] = await query({
      sql: "SELECT * FROM generated_codes WHERE code = ?",
      values: [code],
    });

    const getYearFromCreated = new Date(result.created_at).getFullYear();
    const currentYear = new Date().getFullYear();

    if (!result) {
      errors.push({ code: "Invalid code." });
    } else {
      if (result.status === "redeemed") {
        errors.push({ code: "Code already redeemed." });
      }

      if (decoded.userId !== result.code_owner) {
        errors.push({ code: "Only the owner can redeem this code." });
      }
    }

    // Return errors if any
    if (errors.length > 0) {
      return res.status(422).json({
        message: "Validation failed. Please check the errors.",
        errors,
      });
    }

    next();
  } catch (error) {
    console.error("Error in redeemCodeValidator:", error.message);
    return res
      .status(500)
      .json({ message: "An internal server error occurred." });
  }
};

module.exports = { redeemCodeValidator };
