// controllers/employee/registerEmployee.js
const bcrypt = require('bcrypt');
const pool = require('../../config/db');
const generateEmployeeCode = require('../../utils/employeeCodeGenerator');
const generatePassword = require('../../utils/passwordGenerator');
const sendMail = require('../../utils/mailer');
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');

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
        const firstNameClean = first_name.trim().toLowerCase();
    const lastNameClean = last_name.trim().toLowerCase();
    const companyEmail = `${firstNameClean}${lastNameClean}@digitalblanket.ai`;
    
    
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

module.exports = registerEmployee;