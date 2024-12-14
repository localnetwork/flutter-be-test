const { query } = require("../config/db");
const jwt = require("jsonwebtoken");

const helper = require("../lib/helper");
const addNotification = async (req, res, next) => {
  return res.status(200).json({
    message: "Notification added successfully",
  });
};

const getNotifications = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
  const userId = decoded?.userId;
  try {
    let results = [];

    if (decoded?.role === 1) {
      results = await query({
        sql: "SELECT * FROM notifications WHERE sent_to = ? ORDER BY created_at DESC",
        values: [userId],
      });
    } else {
      results = await query({
        sql: "SELECT * FROM notifications WHERE sent_to = ? ORDER BY updated_at DESC",
        values: [userId],
      });
    }

    return res.status(200).json({
      data: results,
      unread_count: results.filter((result) => result.has_read === 0).length,
      read_count: results.filter((result) => result.has_read === 1).length,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateNotification = async (req, res, next) => {
  const { status, id, item } = req.body;

  console.log("item", item);
  const add_info = JSON.parse(item?.additional_info);

  try {
    // START PENDING
    if (item?.status === "pending") {
      await query({
        sql: "UPDATE notifications SET status = ?, updated_at = ?, has_read = 1 WHERE id = ?",
        values: ["ready", helper.currentTimestamp(), id],
      });

      await query({
        sql: "UPDATE reward_claims SET status = ?, updated_at = ? WHERE user_id = ? AND threshold_level = ?",
        values: [
          "ready",
          helper.currentTimestamp(),
          item?.sent_by,
          add_info?.threshold_level,
        ],
      });

      await query({
        sql: "INSERT INTO notifications (sent_to, type, sent_by, body, additional_info, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        values: [
          item?.sent_by,
          "reward-message",
          item?.sent_to,
          `<strong>${add_info?.reward?.name}</strong> is ready to claim on the next event. Ensure attendance to receive your reward`,
          JSON.stringify(add_info),
          helper.currentTimestamp(),
        ],
      });
    }
    // END PENDING

    if (item?.status === "ready") {
      await query({
        sql: "UPDATE notifications SET status = ?, updated_at = ?, has_read = 1 WHERE id = ?",
        values: ["approved", helper.currentTimestamp(), id],
      });

      await query({
        sql: "UPDATE reward_claims SET status = ?, approved_by = ?, updated_at = ?  WHERE user_id = ? AND threshold_level = ?",
        values: [
          "approved",
          item?.sent_to,
          helper.currentTimestamp(),
          item?.sent_by,
          add_info?.threshold_level,
        ],
      });

      await query({
        sql: "INSERT INTO notifications SET status = ?, body = ?, type = ?, created_at = ?, updated_at = ?, has_read = 0, sent_to = ?, sent_by = ?, additional_info = ?",
        values: [
          "approved",
          "You've received your reward. Enjoy!",
          "reward-completed",
          helper.currentTimestamp(),
          helper.currentTimestamp(),
          item?.sent_by,
          item?.sent_to,
          item?.additional_info,
        ],
      });
    }

    return res.status(200).json({
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.log("Err", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateNotificationRead = async (req, res, next) => {
  const { id } = req.params;
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
  const userId = decoded?.userId;

  try {
    await query({
      sql: "UPDATE notifications SET has_read = 1 WHERE id = ? AND sent_to = ?",
      values: [id, userId],
    });

    return res.status(200).json({
      message: "Notification has been read successfully.",
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  addNotification,
  getNotifications,
  updateNotification,
  updateNotificationRead,
};
