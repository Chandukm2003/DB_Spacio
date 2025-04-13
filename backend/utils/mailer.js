const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Send email for either account registration or password reset.
 * 
 * @param {string} to - Recipient personal email for forgot password OR personal email for registration
 * @param {string} employeeCode - Employee ID/code
 * @param {string|null} tempPassword - Temporary password (null for forgot password)
 * @param {string} resetLink - Link to reset password
 * @param {string} companyEmail - Company email address
 * @param {boolean} isForgot - Flag to determine email type
 */
const sendMail = async (to, employeeCode, tempPassword, resetLink, companyEmail, isForgot = false) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const subject = isForgot
    ? '🔐 Reset Your Password - Digital Banket'
    : '🎉 Welcome to Digital Banket - Set Your Password';

  const html = isForgot
    ? `
        <h3>Forgot Password</h3>
        <p>Hi there,</p>
        <p>We received a request to reset the password for your account linked to <strong>${companyEmail}</strong>.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, please ignore the email.</p>
      `
    : `
        <h3>Welcome to Digital Banket!</h3>
        <p><strong>Employee Code:</strong> ${employeeCode}</p>
        <p><strong>Company Email:</strong> ${companyEmail}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please click the link below to set your new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email failed to send:", error);
    } else {
      console.log("✅ Email sent successfully:", info.response);
      console.log("📤 Attempting to send to:", to);
    }
  });
  };

module.exports = sendMail;
