const emailValidator = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const hidSensitiveData = (data) => {
  const newData = { ...data };
  delete newData.password;
  return newData;
};

module.exports = { emailValidator, hidSensitiveData };
