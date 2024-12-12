const { query } = require("../config/db");
const helper = require("../lib/helper");
const updateMilestones = async (req, res) => {
  const { thresholds, thresholdCount } = req.body;

  const findThresholdinDb = async (thresholdLevel) => {
    const [result] = await query({
      sql: "SELECT * FROM milestone_thresholds WHERE threshold_level = ?",
      values: [thresholdLevel],
    });
    return result;
  };

  const existInThresholds = async (thresholdLevel) => {
    return thresholds.some(
      (threshold) => threshold.threshold === thresholdLevel
    );
  };

  await query({
    sql: `DELETE FROM milestone_thresholds WHERE threshold_level > ?`,
    values: [thresholdCount],
  });

  try {
    if (thresholdCount > 0) {
      for (i = 0; i < thresholdCount; i++) {
        if (await existInThresholds(i + 1)) {
          const foundThreshold = thresholds.find((t) => t.threshold === i + 1);
          const { productId, threshold } = foundThreshold;
          if (await findThresholdinDb(threshold)) {
            await query({
              sql: "UPDATE milestone_thresholds SET item = ? WHERE threshold_level = ?",
              values: [productId, threshold],
            });
          } else {
            await query({
              sql: "INSERT INTO milestone_thresholds (threshold_level, item, created_at) VALUES (?, ?, ?)",
              values: [threshold, productId, helper.currentTimestamp()],
            });
          }
        } else {
          console.log("elseee");
          if (await findThresholdinDb(i + 1)) {
            await query({
              sql: "UPDATE milestone_thresholds SET item = '' WHERE threshold_level = ?",
              values: [i + 1],
            });
          } else {
            await query({
              sql: "INSERT INTO milestone_thresholds (threshold_level, item, created_at) VALUES (?, '', ?)",
              values: [i + 1, helper.currentTimestamp()],
            });
          }
        }
      }
    }

    return res
      .status(200)
      .json({ message: "Milestones updated successfully." });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "An error occurred." });
  }
};

const getThresholds = async (req, res, next) => {
  try {
    const thresholds = await query({
      sql: `
        SELECT mt.*, mr.id AS productId, mr.name as productName, mr.image AS productImage 
        FROM milestone_thresholds mt
        LEFT JOIN milestone_rewards mr ON mt.item = mr.id
        ORDER BY mt.threshold_level ASC
      `,
    });

    return res.status(200).json(thresholds);
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    return res.status(500).json({ message: "An error occurred." });
  }
};

module.exports = { updateMilestones, getThresholds };
