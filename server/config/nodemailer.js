const nodemailer = require("nodemailer");

// Create a reusable SMTP transporter for sending emails.
// Gmail is used as the default provider for enterprise-friendly setup.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify the SMTP connection configuration on startup.
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

module.exports = transporter;
