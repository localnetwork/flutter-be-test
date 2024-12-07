const jsonwebtoken = require("jsonwebtoken");
const { findUserById } = require("../entities/userEntity");
const ageValidator = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];

  if (!token) {
    return res.status(401).json({
      message: "Can't validate age.",
    });
  } else {
    const decoded = jsonwebtoken.decode(token);

    const userId = decoded.userId;

    const foundUser = await findUserById(parseInt(userId));

    if (foundUser.birthday) {
      const birthday = new Date(foundUser.birthday);
      const age = new Date().getFullYear() - birthday.getFullYear();
      if (age < 16 || age >= 31) {
        return res.status(401).json({
          message: "You are not allowed to access this resource.",
        });
      }
    }
  }
  next();
};

module.exports = { ageValidator };
