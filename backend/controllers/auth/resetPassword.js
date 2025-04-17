const bcrypt = require('bcrypt');
const pool = require('../../config/db');
const logger = require('../../utils/logger');

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

module.exports = resetPassword;