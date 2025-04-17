const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const generateEmployeeCode = require('../utils/employeeCodeGenerator');
const generatePassword = require('../utils/passwordGenerator');
const sendMail = require('../utils/mailer');
const logger = require('../utils/logger');

const registerEmployee = async (req, res) => {
  const {
    first_name, last_name, email, manager_name,
    department, joining_date, employment_type,
    vendor_name, role
  } = req.body;

  try {
    // 1. Validate required fields
    if (!first_name || !last_name || !email || !joining_date || !employment_type || !department || !role) {
      logger.warn('Registration failed: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (employment_type === 'Contractual' && !vendor_name) {
      logger.warn('Vendor name required for contractual employee');
      return res.status(400).json({ message: 'Vendor name required for contractual employees' });
    }

    // 2. Check if employee already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      logger.warn(`Registration failed: Email already exists - ${email}`);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 3. Generate Employee Code and Password
    const employee_code = await generateEmployeeCode(department);
    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 4. Generate company email
    const firstNameClean = first_name.trim().toLowerCase();
    const lastNameClean = last_name.trim().toLowerCase();
    const companyEmail = `${firstNameClean}${lastNameClean}@digitalblanket.ai`;

    // 5. Generate JWT Token for password reset link
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // 6. Create Employee object
    const employee = new Employee({
      first_name, last_name, email, manager_name, department,
      joining_date, employment_type, vendor_name: vendor_name || null,
      employee_code, company_email: companyEmail, role,
      password_hash: hashedPassword, temp_password: true
    });

    // 7. Save employee to MongoDB
    await employee.save();

    // 8. Send email with temporary password and reset link
    await sendMail(email, employee_code, tempPassword, resetLink, companyEmail);
    logger.info(`Employee registered: ${employee_code} | Email: ${email}`);

    // 9. Return success response
    res.status(201).json({
      message: 'Employee registered successfully',
      employee_code,
      companyEmail
    });

  } catch (err) {
    logger.error(`Registration error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Failed to register employee' });
  }
};


const resetPassword = async (req, res) => {
  const { companyEmail, tempPassword, newPassword } = req.body;

  try {
    // Validate newPassword for basic strength (optional)
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const employee = await Employee.findOne({ company_email: companyEmail });

    if (!employee || !employee.temp_password) {
      logger.warn(`Reset password failed for ${companyEmail}: Invalid request or password already set`);
      return res.status(400).json({ message: 'Invalid request or password already set' });
    }

    // Check if the temporary password matches
    const isMatch = await bcrypt.compare(tempPassword, employee.password_hash);
    if (!isMatch) {
      logger.warn(`Incorrect temporary password for ${companyEmail}`);
      return res.status(400).json({ message: 'Incorrect temporary password' });
    }

    // Check if the new password is different from the old one (optional but recommended)
    if (newPassword === tempPassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the temporary password' });
    }

    // Hash and set the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    employee.password_hash = hashedNewPassword;
    employee.temp_password = false; // Mark as no longer a temporary password
    await employee.save();

    logger.info(`Password reset successfully for ${companyEmail}`);
    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    logger.error(`Reset password error for ${companyEmail}: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Server error' });
  }
};


const setNewPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { companyEmail } = decoded;

    const employee = await Employee.findOne({ company_email: companyEmail });

    if (!employee) {
      return res.status(404).json({ message: 'User not found' });
    }

    employee.password_hash = await bcrypt.hash(newPassword, 10);
    employee.temp_password = false;
    await employee.save();

    logger.info(`Password updated for ${companyEmail}`);
    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    logger.error(`Set new password error: ${err.message}`, { stack: err.stack });
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

const loginEmployee = async (req, res) => {
  const { email, password, role } = req.body;
  console.log('Received login request:', { email, role }); // Add logging to check inputs
  // role = role.toLowerCase();
  try {
    const user = await Employee.findOne({ company_email: email});

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(role, user.role)
    if (user.role.toLowerCase() !== role) {
      console.log('Role mismatch');
      return res.status(403).json({ message: 'Role mismatch' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.log('Error during login:', error.message);
    logger.error('Login error:', error.message);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
};



const forgotPassword = async (req, res) => {
  const { companyEmail } = req.body;

  try {
    const user = await Employee.findOne({ company_email: companyEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ companyEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/set-new-password?token=${resetToken}`;

    await sendMail(user.company_email, user.employee_code, null, resetLink, user.company_email, true);

    logger.info(`Reset link sent to: ${user.company_email}`);
    res.json({ message: 'Reset link sent to your email' });

  } catch (error) {
    logger.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerEmployee,
  resetPassword,
  setNewPassword,
  loginEmployee,
  forgotPassword
};