const express = require('express');
const router = express.Router();

const {
  registerEmployee,
  resetPassword,
  loginEmployee,
  forgotPassword,
  setNewPassword
} = require('../controllers/employeeController');

router.post('/register', registerEmployee);
router.post('/reset-password', resetPassword);
router.post('/login', loginEmployee);
router.post('/forgot-password', forgotPassword);
router.post('/set-new-password', setNewPassword);

module.exports = router;