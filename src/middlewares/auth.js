const jwt = require("jsonwebtoken");

const { findUserById } = require("../entities/userEntity");

const isLoggedIn = (req, res, next) => {
  const messageTxt = "Unauthorized.";
  const token = req?.headers?.authorization?.split(" ")?.[1];

  if (!token) {
    return res.status(401).json({
      message: messageTxt,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
    // req.user = decoded;
  } catch (error) {
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
    return res.status(401).json({
      message: messageTxt,
    });
  }
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

const isVerified = async (req, res, next) => {
  const messageTxt = "Unauthorized.";
  const token = req?.headers?.authorization?.split(" ")?.[1];

  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const userId = decoded.userId;

  const foundUser = await findUserById(userId);

  if (foundUser.verified === 0 && foundUser.role !== 1) {
    return res.status(422).json({
      message: "Unable to proceed. Account not verified.",
    });
  }
  next();
};

const isApproved = async (req, res, next) => {
  const messageTxt = "Unauthorized.";
  const token = req?.headers?.authorization?.split(" ")?.[1];

  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const userId = decoded.userId;

  const foundUser = await findUserById(parseInt(userId));

  if (foundUser.status === 0 && foundUser.role !== 1) {
    return res.status(422).json({
      message: "Unable to proceed. Account not approved.",
    });
  }
  next();
};

const isMember = async (req, res, next) => {
  const messageTxt = "Unauthorized.";
  const token = req?.headers?.authorization?.split(" ")?.[1];

  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const userId = decoded.userId;

  const foundUser = await findUserById(userId);

  if (foundUser.role !== 2) {
    return res.status(422).json({
      message: "Only member can perform this action.",
    });
  }

  next();
};

module.exports = { isLoggedIn, isAdmin, isVerified, isApproved, isMember };
