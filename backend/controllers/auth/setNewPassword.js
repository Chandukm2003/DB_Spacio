const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../../config/db');
const logger = require('../../utils/logger');

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

module.exports = setNewPassword;