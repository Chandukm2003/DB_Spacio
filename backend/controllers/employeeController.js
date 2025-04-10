const bcrypt = require('bcrypt');
const pool = require('../config/db');
const generateEmployeeCode = require('../utils/employeeCodeGenerator');
const generatePassword = require('../utils/passwordGenerator');
const sendMail = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger'); // Fixed relative path here

const registerEmployee = async (req, res) => {
  const {
    first_name, last_name, email,
    manager_name, department,
    joining_date, employment_type, vendor_name
  } = req.body;

  try {
    if (!first_name || !last_name || !email || !joining_date || !employment_type || !department) {
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
    const companyEmail = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@digitalbanket.ai`;

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await sendMail(email, employee_code, tempPassword, resetLink, companyEmail);

    await pool.query(
      `INSERT INTO employees
        (first_name, last_name, email, manager_name, employee_code, joining_date, employment_type, vendor_name, password_hash, temp_password, company_email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        first_name, last_name, email, manager_name,
        employee_code, joining_date, employment_type,
        vendor_name || null, hashedPassword, true, companyEmail
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

const loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM employees WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 🧙‍♂️ Add the role in the token here!
    const token = jwt.sign(
      {
        employee_id: user.employee_id,
        email: user.email,
        role: user.role // 👑 This makes your admin powers work
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

module.exports = { registerEmployee, resetPassword, loginEmployee };
