const transporter = require("../config/nodemailer");

/**
 * Send an HTML email using the configured transporter.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} html - HTML content for the email body.
 * @returns {Promise<void>}
 */
const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send a confirmation email when a complaint is submitted.
 * @param {string} to - Recipient email address.
 * @param {object} data - Dynamic email data.
 * @returns {Promise<void>}
 */
const sendComplaintSubmittedEmail = async (to, data = {}) => {
  const { complaintId, title, citizenName } = data;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Complaint Received</h2>
      <p>Hi ${citizenName || "there"},</p>
      <p>Your complaint <strong>${title || "Untitled Complaint"}</strong> has been received successfully.</p>
      <p>Reference ID: <strong>${complaintId || "N/A"}</strong></p>
      <p>We will review it and keep you updated.</p>
    </div>
  `;

  await sendMail(to, "Complaint Submitted Successfully", html);
};

/**
 * Send an email when a complaint is assigned to an officer.
 * @param {string} to - Recipient email address.
 * @param {object} data - Dynamic email data.
 * @returns {Promise<void>}
 */
const sendComplaintAssignedEmail = async (to, data = {}) => {
  const { complaintId, title, officerName, department } = data;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Complaint Assigned</h2>
      <p>Hello,</p>
      <p>A complaint titled <strong>${title || "Untitled Complaint"}</strong> has been assigned to <strong>${officerName || "an officer"}</strong>.</p>
      <p>Department: <strong>${department || "N/A"}</strong></p>
      <p>Reference ID: <strong>${complaintId || "N/A"}</strong></p>
    </div>
  `;

  await sendMail(to, "Complaint Assigned", html);
};

/**
 * Send a resolution email once a complaint is resolved.
 * @param {string} to - Recipient email address.
 * @param {object} data - Dynamic email data.
 * @returns {Promise<void>}
 */
const sendComplaintResolvedEmail = async (to, data = {}) => {
  const { complaintId, title, resolutionNote } = data;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Complaint Resolved</h2>
      <p>Hello,</p>
      <p>Your complaint <strong>${title || "Untitled Complaint"}</strong> has been resolved.</p>
      <p>Reference ID: <strong>${complaintId || "N/A"}</strong></p>
      <p>${resolutionNote || "Thank you for your patience and cooperation."}</p>
    </div>
  `;

  await sendMail(to, "Complaint Resolved", html);
};

/**
 * Send a password reset email.
 * @param {string} to - Recipient email address.
 * @param {object} data - Dynamic email data.
 * @returns {Promise<void>}
 */
const sendForgotPasswordEmail = async (to, data = {}) => {
  const { resetUrl, name } = data;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request</h2>
      <p>Hi ${name || "there"},</p>
      <p>We received a request to reset your password. Click the link below to continue:</p>
      <p><a href="${resetUrl || "#"}">Reset Password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendMail(to, "Reset Your Password", html);
};

module.exports = {
  sendComplaintSubmittedEmail,
  sendComplaintAssignedEmail,
  sendComplaintResolvedEmail,
  sendForgotPasswordEmail,
};
