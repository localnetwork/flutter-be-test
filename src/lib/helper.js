const jwt = require("jsonwebtoken");
const emailValidator = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const hidSensitiveData = (data) => {
  const newData = { ...data };
  delete newData.password;
  return newData;
};

const getUserByToken = (token) => {
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);
  return decoded;
};

const catchError = async (promise) => {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error];
  }
};

module.exports = {
  emailValidator,
  hidSensitiveData,
  getUserByToken,
  catchError,
};
