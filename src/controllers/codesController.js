const { query } = require("../config/db");
const jwt = require("jsonwebtoken");
const redeemCode = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
  const userId = decoded?.userId;
  const { code } = req.body;
  try {
    const codeResult = await query({
      sql: "SELECT generated_codes.*, events.* FROM generated_codes JOIN events ON generated_codes.event_id = events.id WHERE generated_codes.code = ?",
      values: [code],
    });

    const updateCodeStatus = await query({
      sql: "UPDATE generated_codes SET status = 'redeemed' WHERE code = ?",
      values: [code],
    });

    console.log("codeResult", codeResult[0]?.allocated_stamps);

    const updateStamp = await query({
      sql: "UPDATE users SET stamps = ? WHERE id = ?",
      values: [codeResult[0]?.allocated_stamps || 0, userId],
    });

    return res.status(200).json({
      message: "Code redeemed successfully",
    });
  } catch (error) {
    console.error("Error redeeming code:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { redeemCode };
