const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const logger = require('../utils/logger'); // Optional

const setNewPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  try {
    // 💥 Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyEmail = decoded.companyEmail;

    // 🔍 Get the user
    const result = await pool.query(
      'SELECT * FROM employees WHERE company_email = $1',
      [companyEmail]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🔑 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 📝 Update in DB
    await pool.query(
      'UPDATE employees SET password = $1 WHERE company_email = $2',
      [hashedPassword, companyEmail]
    );

    logger?.info(`Password updated for ${companyEmail}`);
    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    logger?.error(`Reset password error: ${err.message}`, { stack: err.stack });
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Reset link has expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = setNewPassword;
