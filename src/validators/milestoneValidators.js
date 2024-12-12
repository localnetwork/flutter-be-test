const milestoneCreateValidator = (req, res, next) => {
  const { thresholds, thresholdCount } = req.body;

  let errors = [];

  if (!thresholdCount || thresholdCount.length === 0) {
    errors.push({ thresholds: "Thresholds is required." });
  }

  if (thresholds) {
    if (!Array.isArray(thresholds)) {
      errors.push({ thresholds: "Thresholds must be an array." });
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

module.exports = { milestoneCreateValidator };
