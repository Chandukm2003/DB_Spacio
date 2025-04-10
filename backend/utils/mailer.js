const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMail = async (to, employeeCode, tempPassword, resetLink, companyEmail) => {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Employee Registration - Set Your Password',
      html: `
        <h3>Welcome to the Company!</h3>
        <p><strong>Employee Code:</strong> ${employeeCode}</p>
        <p><strong>Company Email:</strong> ${companyEmail}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please click the link below to set your new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  module.exports = sendMail;