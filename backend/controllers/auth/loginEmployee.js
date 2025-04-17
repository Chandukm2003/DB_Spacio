const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

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

module.exports = loginEmployee;