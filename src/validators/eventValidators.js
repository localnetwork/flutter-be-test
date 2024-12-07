const multer = require("multer");
const upload = multer();

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

  console.log("eventImage", eventImage);

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

module.exports = {
  eventCreateValidator,
};
