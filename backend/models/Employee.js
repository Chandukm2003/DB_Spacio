const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  manager_name: String,
  department: String,
  joining_date: Date,
  employment_type: String,
  vendor_name: String,
  employee_code: String,
  company_email: { type: String, unique: true },
  role: String,
  password_hash: String,
  temp_password: { type: Boolean, default: true }
});

module.exports = mongoose.model('Employee', employeeSchema);