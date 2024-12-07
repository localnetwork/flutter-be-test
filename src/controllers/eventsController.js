const { query } = require("../config/db");

const getMemberEvents = async (req, res, next) => {
  try {
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const addEvent = async (req, res, next) => {};

module.exports = { getMemberEvents, addEvent };
