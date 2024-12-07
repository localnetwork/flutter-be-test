const jwt = require("jsonwebtoken");
const emailValidator = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const currentTimestamp = () => {
  return new Date().getTime(); // Returns the current timestamp in milliseconds
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
const addError = (errors, field, message) => {
  errors.push({ [field]: message });
};
const validateRequiredField = (field, fieldName, message, errors) => {
  if (!field) addError(errors, fieldName, message);
};

module.exports = {
  emailValidator,
  hidSensitiveData,
  getUserByToken,
  catchError,
  addError,
  validateRequiredField,
  currentTimestamp,
};
