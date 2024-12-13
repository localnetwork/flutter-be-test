const { query } = require("../config/db");
const { validateRequiredField } = require("../lib/helper");
const jwt = require("jsonwebtoken");
const createRewardValidator = (req, res, next) => {
  const { name } = req.body;

  let rewardImage = req.file;

  let errors = [];
  validateRequiredField(name, "name", "Name is required.", errors);

  validateRequiredField(rewardImage, "image", "Image is required.", errors);

  // Return errors if validation fails
  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

const rewardClaimValidator = async (req, res, next) => {
  const { threshold, productId } = req.body;

  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  let errors = [];

  const [findClaim] = await query({
    sql: "SELECT * FROM reward_claims WHERE user_id = ? AND threshold_level = ?",
    values: [decoded.userId, threshold],
  });

  if (findClaim?.status === "pending") {
    return res.status(422).json({
      message: "You have a pending claim for this reward.",
    });
  }

  if (findClaim?.status === "ready") {
    return res.status(422).json({
      message: "This reward is ready for pickup.",
    });
  }
  if (findClaim?.status === "approved") {
    return res.status(422).json({
      message: "You have already claimed this reward.",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors: errors,
    });
  }

  next();
};

module.exports = { createRewardValidator, rewardClaimValidator };
