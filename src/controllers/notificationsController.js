const addNotification = async (req, res, next) => {
  return res.status(200).json({
    message: "Notification added successfully",
  });
};

module.exports = {
  addNotification,
};
