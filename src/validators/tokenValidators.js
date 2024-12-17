const { query } = require("../config/db");
const getTokenValidator = async (req, res, next) => {
  const { token } = req.params;

  const [result] = await query({
    sql: "SELECT * FROM tokens WHERE token = ?",
    values: [token],
  });
  if (result?.status == "completed") {
    return res.status(422).json({
      message: "Link already used.",
    });
  }

  if (!result) {
    return res.status(404).json({
      message: "Link not found.",
    });
  }

  if (result.expired_at && result.expired_at < Date.now()) {
    return res.status(422).json({
      message: "Link is no longer available.",
    });
  }
  next();
};

module.exports = { getTokenValidator };
