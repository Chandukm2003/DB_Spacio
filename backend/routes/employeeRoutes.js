const express = require('express');
const router = express.Router();

const {
  registerEmployee,
  resetPassword,
  loginEmployee,
  forgotPassword,
} = require('../controllers/employeeController');

const setNewPassword = require('../controllers/setNewPassword'); // 💥 Import this controller

// 🛠️ Routes
router.post('/register', registerEmployee);
router.post('/reset-password', resetPassword); // for temp password reset
router.post('/login', loginEmployee);
router.post('/forgot-password', forgotPassword); // for sending email with token
router.post('/set-new-password', setNewPassword); // 💥 New route for final password update

module.exports = router;
