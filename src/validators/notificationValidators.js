const { query } = require("../config/db");
const jwt = require("jsonwebtoken");
const createNotificationValidator = (req, res, next) => {
  return res.status(200).json({ message: "Notification created successfully" });
};

const updateNotificationValidator = (req, res, next) => {
  const { type } = req.body;
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
  const userRole = decoded?.role;

  if (type === "reward-claim" && userRole !== 1) {
    return res
      .status(422)
      .json({ message: "You are not authorized to perform this action" });
  }

  if (type === "reward-message" && userRole !== 2) {
    return res
      .status(422)
      .json({ message: "You are not authorized to perform this action" });
  }

  next();
};

const updateNotificationReadValidator = async (req, res, next) => {
  const { id } = req.params;
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
  const userId = decoded?.userId;

  try {
    const [notification] = await query({
      sql: "SELECT * FROM notifications WHERE sent_to = ? AND has_read = 0",
      values: [userId],
    });
    if (notification?.sent_to !== userId) {
      return res
        .status(422)
        .json({ message: "You are not authorized to perform this action" });
    }

    next();
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createNotificationValidator,
  updateNotificationValidator,
  updateNotificationReadValidator,
};
