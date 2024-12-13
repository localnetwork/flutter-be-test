const helper = require("../lib/helper");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const claimReward = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const { threshold, productId } = req.body;
  try {
    const results = await query({
      sql: "INSERT INTO reward_claims (user_id, created_at, threshold_level, status) VALUES (?, ?, ?, ?)",
      values: [
        decoded?.userId,
        helper?.currentTimestamp(),
        threshold,
        "pending",
      ],
    });

    const adminUsers = await query({
      sql: "SELECT * FROM users WHERE role = 1",
    });

    const [rewardInfo] = await query({
      sql: `
        SELECT 
          mt.*, 
          mr.name AS reward_name, 
          u.first_name, 
          u.last_name 
        FROM 
          milestone_thresholds mt
        JOIN 
          milestone_rewards mr ON mt.item = mr.id
        JOIN 
          users u ON u.id = ?
        WHERE 
          mt.threshold_level = ?
      `,
      values: [decoded?.userId, threshold],
    });

    const [reward] = await query({
      sql: "SELECT * FROM milestone_rewards WHERE id = ?",
      values: [productId],
    });

    adminUsers.forEach((admin) => {
      query({
        sql: "INSERT INTO notifications (type, status, has_read, sent_by, sent_to, body, created_at, additional_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        values: [
          "reward-claim",
          "pending",
          0,
          decoded?.userId,
          admin?.id,
          `<strong>${rewardInfo.last_name},  ${rewardInfo.first_name}</strong> has redeemed ${rewardInfo.reward_name}.`,
          helper?.currentTimestamp(),
          JSON.stringify({ reward: reward, threshold_level: threshold }),
        ],
      });
    });

    return res.status(200).json({
      message:
        "Reward claimed successfully. We have notified the admins about your reward.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const addReward = async (req, res, next) => {
  const { name } = req.body;
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  let eventImage = req.file;

  const imagePath = `/images/rewards/${eventImage?.filename}`;
  const timestamp = helper.currentTimestamp();

  try {
    const results = await query({
      sql: "INSERT INTO milestone_rewards (name, created_at, created_by, image) VALUES (?, ?, ?, ?)",
      values: [name, timestamp, decoded?.userId, imagePath],
    });

    return res.status(200).json({
      message: "Reward added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getRewards = async (req, res, next) => {
  const searchTerm = req.query.s;
  let sql = "SELECT * FROM milestone_rewards";
  let values = [];

  if (searchTerm) {
    sql += " WHERE name LIKE ?";
    values.push(`%${searchTerm}%`);
  }

  try {
    const results = await query({
      sql,
      values,
    });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const claimableRewards = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split(" ")?.[1];
    const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

    const userId = decoded?.userId;

    const [user] = await query({
      sql: "SELECT * FROM users WHERE id = ?",
      values: [userId],
    });

    const userStamps = user?.stamps;

    const rewards = await query({
      sql: `
        SELECT 
          milestone_thresholds.*, 
          milestone_rewards.*, milestone_rewards.id AS productId,
          reward_claims.status AS claim_status 
        FROM 
          milestone_thresholds 
        JOIN 
          milestone_rewards ON milestone_rewards.id = milestone_thresholds.item 
        LEFT JOIN 
          reward_claims ON reward_claims.threshold_level = milestone_thresholds.threshold_level 
          AND reward_claims.threshold_level = milestone_thresholds.threshold_level 
          AND reward_claims.user_id = ?
        WHERE 
          milestone_thresholds.threshold_level <= ?
      `,
      values: [userId, userStamps],
    });

    return res.status(200).json(rewards);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { claimReward, addReward, getRewards, claimableRewards };
