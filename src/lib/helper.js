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

const hidSensitivePropertiesFromArray = (data) => {
  return data.map((item) => {
    return hidSensitiveData(item);
  });
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

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let hasLetter = false;
  let hasNumber = false;

  while (code.length < 4 || !hasLetter || !hasNumber) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    code += char;
    if (/[A-Z]/.test(char)) hasLetter = true;
    if (/[0-9]/.test(char)) hasNumber = true;
  }

  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of the current timestamp
  return `${code}${timestamp}`; // Combine the code with the timestamp
};

module.exports = {
  emailValidator,
  hidSensitiveData,
  getUserByToken,
  catchError,
  addError,
  validateRequiredField,
  currentTimestamp,
  generateCode,
  hidSensitivePropertiesFromArray,
};
