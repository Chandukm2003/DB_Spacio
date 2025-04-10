const express = require('express');
const router = express.Router();
const {
  registerEmployee,
  resetPassword,
  loginEmployee 
} = require('../controllers/employeeController');

router.post('/register', registerEmployee);
router.post('/reset-password', resetPassword); 
router.post('/login', loginEmployee);
// ✅ THIS LINE IS NEEDED

module.exports = router;
