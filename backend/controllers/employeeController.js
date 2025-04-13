const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateEmployeeCode = require('../utils/employeeCodeGenerator');
const generatePassword = require('../utils/passwordGenerator');
const sendMail = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const registerEmployee = async (req, res) => {
  const {
    first_name, last_name, email,
    manager_name, department,
    joining_date, employment_type, vendor_name, role
  } = req.body;

  try {
    if (!first_name || !last_name || !email || !joining_date || !employment_type || !department || !role) {
      logger.warn('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (employment_type === 'Contractual' && !vendor_name) {
      logger.warn('Registration failed: Vendor name required for contractual employee');
      return res.status(400).json({ message: 'Vendor name required for contractual employees' });
    }

    const existing = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      logger.warn(`Registration failed: Email already exists - ${email}`);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const employee_code = await generateEmployeeCode(department);
    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const companyEmail = `${first_name.toLowerCase()}${last_name.toLowerCase()}@digitalblanket.ai`;

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await sendMail(email, employee_code, tempPassword, resetLink, companyEmail);

    await pool.query(
      `INSERT INTO employees
        (first_name, last_name, email, manager_name, employee_code, joining_date, employment_type, vendor_name, password_hash, temp_password, company_email, role, department)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        first_name, last_name, email, manager_name,
        employee_code, joining_date, employment_type,
        vendor_name || null, hashedPassword, true, companyEmail, role, department
      ]
    );

    logger.info(`Employee registered: ${employee_code} | Email: ${email}`);
    res.status(201).json({
      message: 'Employee registered successfully',
      employee_code,
      companyEmail
    });

  } catch (err) {
    logger.error(`Registration error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { companyEmail, tempPassword, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT * FROM employees WHERE company_email = $1', [companyEmail]);
    const employee = result.rows[0];

    if (!employee || !employee.temp_password) {
      logger.warn(`Reset password failed: Invalid request or password already set for ${companyEmail}`);
      return res.status(400).json({ message: 'Invalid request or password already set' });
    }

    const isMatch = await bcrypt.compare(tempPassword, employee.password_hash);
    if (!isMatch) {
      logger.warn(`Reset password failed: Incorrect temporary password for ${companyEmail}`);
      return res.status(400).json({ message: 'Incorrect temporary password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE employees SET password_hash = $1, temp_password = false WHERE company_email = $2',
      [hashedNewPassword, companyEmail]
    );

    logger.info(`Password reset successfully for ${companyEmail}`);
    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    logger.error(`Reset password error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Server error' });
  }
};

const setNewPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { companyEmail } = decoded;

    const result = await pool.query('SELECT * FROM employees WHERE company_email = $1', [companyEmail]);
    const employee = result.rows[0];

    if (!employee) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE employees SET password_hash = $1, temp_password = false WHERE company_email = $2',
      [hashedNewPassword, companyEmail]
    );

    logger.info(`Password updated via forgot password flow for ${companyEmail}`);
    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    logger.error(`Set new password error: ${err.message}`, { stack: err.stack });
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

const loginEmployee = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const result = await pool.query('SELECT * FROM employees WHERE company_email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      {
        employee_id: user.employee_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('[ERROR]: Login -', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { companyEmail } = req.body;

    const result = await pool.query('SELECT * FROM employees WHERE company_email = $1', [companyEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ companyEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/set-new-password?token=${resetToken}`;

    await sendMail(user.company_email, user.employee_code, null, resetLink, user.company_email, true);

    logger.info(`Forgot password link sent to personal email: ${user.company_email}`);
    res.json({ message: 'Reset link sent to your personal email' });

  } catch (error) {
    logger.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerEmployee,
  resetPassword,          // for temp password flow
  setNewPassword,         // for forgot password flow
  loginEmployee,
  forgotPassword
};
