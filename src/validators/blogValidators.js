const createBlogValidation = (req, res, next) => {
  const { title, body } = req.body;

  const errors = [];

  if (!title) {
    errors.push({
      title: "Title is required",
    });
  }

  if (!body) {
    errors.push({
      body: "Body is required",
    });
  }

  if (errors.length > 0) {
    return res.status(422).json({
      message: "Please check the errors in the fields.",
      errors: errors,
    });
  }

  next();
};

module.exports = { createBlogValidation };
