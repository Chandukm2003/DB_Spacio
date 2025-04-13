// const jwt = require('jsonwebtoken');
// const pool = require('../config/db');
// const sendMail = require('../utils/mailer');
// const logger = require('../utils/logger');

// const forgotPassword = async (req, res) => {
//   const { companyEmail } = req.body;

//   try {
//     // ✅ Explicit alias for clarity
//     const result = await pool.query(`
//         SELECT 
//           employee_code, 
//           company_email, 
//           email as personal_email 
//         FROM employees 
//         WHERE company_email = $1
//       `, [companyEmail]);

//     const user = result.rows[0];

//     if (!user) {
//       logger?.warn(`Forgot password failed: No user found with ${companyEmail}`);
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // 🔐 JWT token
//     const token = jwt.sign(
//       { companyEmail: user.company_email },
//       process.env.JWT_SECRET,
//       { expiresIn: '15m' }
//     );

//     // 🔗 Reset link
//     const resetLink = `http://localhost:3000/forgot-password?token=${token}`;

//     // 💌 Now send to personal email
//     await sendMail(
//       user.company_email,       // 🔥 this is now guaranteed to be personal
//       user.employee_code,
//       null,
//       resetLink,
//       user.companyEmail,
//       true
//     );

//     console.log("📤 Attempting to send to personal email:", user.personal_email);
//     console.log("🧠 User object from DB:", user);
//     console.log("📤 Sending reset email to personal:", user.personal_email);
//     logger?.info(`Password reset link sent to personal email of ${companyEmail}`);
//     res.json({ message: 'Password reset link sent to your personal email' });

//   } catch (err) {
//     logger?.error(`Forgot password error: ${err.message}`, { stack: err.stack });
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = forgotPassword;
