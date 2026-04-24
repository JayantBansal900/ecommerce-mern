const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // 👈 ADD THIS
    },
  });

  // 🔥 Verify connection FIRST
  await transporter
    .verify()
    .then(() => console.log("Gmail ready"))
    .catch((err) => console.log("Gmail error:", err));

  const mailOptions = {
    from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
