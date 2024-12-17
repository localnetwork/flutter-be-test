const multer = require("multer");
const upload = multer();
const { query } = require("../config/db");
const {
  emailValidator,
  addError,
  validateRequiredField,
} = require("../lib/helper");

const eventCreateValidator = (req, res, next) => {
  const errors = [];
  const {
    name,
    event_location,
    event_start_datetime,
    event_end_datetime,
    allocated_stamps,
  } = req.body;

  let eventImage = req.file;

  // Validate required fields
  validateRequiredField(name, "name", "Event Name is required.", errors);
  validateRequiredField(
    event_location,
    "event_location",
    "Event Location is required.",
    errors
  );
  validateRequiredField(
    event_start_datetime,
    "event_start_datetime",
    "Event Start Date/Time is required.",
    errors
  );
  validateRequiredField(
    event_end_datetime,
    "event_end_datetime",
    "Event End Date/Time is required.",
    errors
  );
  validateRequiredField(eventImage, "image", "Image is required.", errors);

  // Return errors if validation fails
  if (errors.length > 0) {
    return res.status(422).json({
      message: "Validation failed. Please check the errors.",
      errors,
    });
  }

  next();
};

const eventAttendanceApprovalValidator = async (req, res, next) => {
  const { id, userId } = req.params;
  try {
    const results = await query({
      sql: `
        SELECT * 
        FROM events_participation 
        WHERE event_joined = ? 
          AND user_id = ? 
      `,
      values: [id, userId],
    });

    if (results.length === 0) {
      return res.status(404).json({
        message: "The user didn't participated on this event.",
      });
    }

    next();
  } catch (error) {
    console.error("Error validating event attendance approval:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const joinEventValidator = async (req, res, next) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const results = await query({
      sql: `
        SELECT * 
        FROM events_participation 
        WHERE event_joined = ? 
          AND user_id = ? 
      `,
      values: [id, user_id],
    });

    if (results.length > 0) {
      return res.status(422).json({
        message: "You have already joined this event.",
      });
    }

    next();
  } catch (error) {
    console.error("Error validating join event:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  eventCreateValidator,
  joinEventValidator,
  eventAttendanceApprovalValidator,
};
