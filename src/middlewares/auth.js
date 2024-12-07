const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
  const messageTxt = "Unauthorized.";
  const token = req?.headers?.authorization?.split(" ")?.[1];

  if (!token) {
    console.log("no token");
    return res.status(401).json({
      message: messageTxt,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    // req.user = decoded;
  } catch (error) {
    console.log("token invalid");
    return res.status(401).json({
      message: messageTxt,
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  const messageTxt = "Unauthorized.";
  const token = req?.headers?.authorization?.split(" ")?.[1];

  if (!token) {
    console.log("no token");
    return res.status(401).json({
      message: messageTxt,
    });
  }
  console.log("eeeee");
  try {
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    // req.user = decoded;

    if (decoded.role != 1) throw new Error("Unauthorized");
  } catch (error) {
    return res.status(401).json({
      message: messageTxt,
    });
  }
  next();
};

module.exports = { isLoggedIn, isAdmin };
