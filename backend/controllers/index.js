const registerEmployee = require('./employee/registerEmployee');
const loginEmployee = require('./auth/loginEmployee');
const resetPassword = require('./auth/resetPassword');
const setNewPassword = require('./auth/setNewPassword');
const forgotPassword = require('./auth/forgotPassword');

module.exports = {
  registerEmployee,
  loginEmployee,
  resetPassword,
  setNewPassword,
  forgotPassword,
};