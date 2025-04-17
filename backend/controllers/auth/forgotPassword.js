const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const logger = require('../../utils/logger');
const sendMail = require('../../utils/mailer');

const forgotPassword = async (req, res) => {
  // your forgot password logic
};

module.exports = forgotPassword;