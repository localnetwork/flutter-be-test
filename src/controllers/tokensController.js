const { query } = require("../config/db");
const jwt = require("jsonwebtoken");
const { sendVerificationSuccess } = require("../mail/userMail");
const getToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    const [result] = await query({
      sql: "SELECT * FROM tokens WHERE token = ?",
      values: [token],
    });
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

    const userId = decoded.userId;

    if (result?.type === "verification" && result?.status === "pending") {
      await query({
        sql: "UPDATE tokens SET status = 'completed' WHERE token = ?",
        values: [token],
      });
      await query({
        sql: "UPDATE users SET verified = 1 WHERE id = ?",
        values: [userId],
      });

      const data = decoded;
      sendVerificationSuccess(data);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { getToken };
