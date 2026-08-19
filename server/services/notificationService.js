const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendComplaintSubmittedEmail, sendComplaintAssignedEmail, sendComplaintResolvedEmail } = require("./emailService");
const { sendPushNotification } = require("./firebaseNotificationService");

const sendPushToRecipient = async (recipient, title, message, complaintId, type) => {
  if (!recipient || !recipient.firebaseDeviceTokens?.length) {
    return null;
  }

  return sendPushNotification(recipient.firebaseDeviceTokens, {
    notification: {
      title,
      body: message,
    },
    data: {
      complaintId: complaintId || "",
      type: type || "General",
      message,
      title,
    },
  });
};

const normalizeUserId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id.toString();
  return value.toString();
};

const isValidObjectId = (value) => {
  if (!value) return false;
  return mongoose.Types.ObjectId.isValid(value);
};

const createNotification = async ({ user, title, message, type = "General", complaint = null }) => {
  try {
    if (!title || !message) {
      throw new Error("Notification title and message are required");
    }

    const normalizedUserId = normalizeUserId(user);
    if (!normalizedUserId || !isValidObjectId(normalizedUserId)) {
      return null;
    }

    const recipient = await User.findById(normalizedUserId).select("name email role");
    if (!recipient) {
      return null;
    }

    const notification = await Notification.create({
      user: normalizedUserId,
      title,
      message,
      type,
      complaint: complaint && isValidObjectId(complaint) ? complaint : null,
    });

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};

const sendEmailForNotification = async (recipient, eventType, complaint) => {
  try {
    if (!recipient?.email) return;

    const complaintId = complaint?._id || complaint?.id || complaint;
    const title = complaint?.title || "Complaint Update";

    switch (eventType) {
      case "Complaint Created":
        await sendComplaintSubmittedEmail(recipient.email, {
          complaintId,
          title,
          citizenName: recipient.name || "there",
        });
        break;
      case "Complaint Assigned":
        await sendComplaintAssignedEmail(recipient.email, {
          complaintId,
          title,
          officerName: recipient.name || "our team",
          department: complaint?.department || "N/A",
        });
        break;
      case "Complaint Resolved":
        await sendComplaintResolvedEmail(recipient.email, {
          complaintId,
          title,
          resolutionNote: "Thank you for your patience and cooperation.",
        });
        break;
      case "Complaint Rejected":
        await sendComplaintResolvedEmail(recipient.email, {
          complaintId,
          title,
          resolutionNote: "Your complaint was reviewed and rejected. Please contact support for more details.",
        });
        break;
      case "Complaint Closed":
        await sendComplaintResolvedEmail(recipient.email, {
          complaintId,
          title,
          resolutionNote: "This complaint has been closed. Thank you for using the platform.",
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Email notification failed:", error.message);
  }
};

const notifyComplaintCreated = async (complaint) => {
  try {
    if (!complaint) return null;

    const citizenId = normalizeUserId(complaint.citizen);
    const complaintId = complaint._id?.toString();

    if (citizenId && isValidObjectId(citizenId)) {
      const notification = await createNotification({
        user: citizenId,
        title: "Complaint Received",
        message: `Your complaint "${complaint.title}" has been received and is under review.`,
        type: "Complaint Created",
        complaint: complaintId,
      });

      if (notification) {
        const recipient = await User.findById(citizenId).select("name email firebaseDeviceTokens");
        await sendEmailForNotification(recipient, "Complaint Created", complaint);
        await sendPushToRecipient(
          recipient,
          "Complaint Received",
          `Your complaint "${complaint.title}" has been received and is under review.`,
          complaintId,
          "Complaint Created"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Complaint created notification failed:", error.message);
    return null;
  }
};

const notifyComplaintAssigned = async (complaint) => {
  try {
    if (!complaint) return null;

    const complaintId = complaint._id?.toString();
    const assigneeId = normalizeUserId(complaint.assignedOfficer);
    const citizenId = normalizeUserId(complaint.citizen);

    const recipients = [];

    if (assigneeId && isValidObjectId(assigneeId)) {
      recipients.push(assigneeId);
    }

    if (citizenId && isValidObjectId(citizenId) && citizenId !== assigneeId) {
      recipients.push(citizenId);
    }

    for (const recipientId of recipients) {
      const notification = await createNotification({
        user: recipientId,
        title: "Complaint Assigned",
        message: `Complaint "${complaint.title}" has been assigned for follow-up.`,
        type: "Complaint Assigned",
        complaint: complaintId,
      });

      if (notification) {
        const recipient = await User.findById(recipientId).select("name email firebaseDeviceTokens");
        await sendEmailForNotification(recipient, "Complaint Assigned", complaint);
        await sendPushToRecipient(
          recipient,
          "Complaint Assigned",
          `Complaint "${complaint.title}" has been assigned for follow-up.`,
          complaintId,
          "Complaint Assigned"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Complaint assigned notification failed:", error.message);
    return null;
  }
};

const notifyComplaintUpdated = async (complaint) => {
  try {
    if (!complaint) return null;

    const complaintId = complaint._id?.toString();
    const citizenId = normalizeUserId(complaint.citizen);
    const assigneeId = normalizeUserId(complaint.assignedOfficer);
    const recipients = [];

    if (citizenId && isValidObjectId(citizenId)) recipients.push(citizenId);
    if (assigneeId && isValidObjectId(assigneeId) && assigneeId !== citizenId) recipients.push(assigneeId);

    for (const recipientId of recipients) {
      const notification = await createNotification({
        user: recipientId,
        title: "Complaint Updated",
        message: `The status of complaint "${complaint.title}" has been updated.`,
        type: "Complaint Updated",
        complaint: complaintId,
      });

      if (notification) {
        const recipient = await User.findById(recipientId).select("name email firebaseDeviceTokens");
        await sendEmailForNotification(recipient, "Complaint Updated", complaint);
        await sendPushToRecipient(
          recipient,
          "Complaint Updated",
          `The status of complaint "${complaint.title}" has been updated.`,
          complaintId,
          "Complaint Updated"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Complaint updated notification failed:", error.message);
    return null;
  }
};

const notifyComplaintResolved = async (complaint) => {
  try {
    if (!complaint) return null;

    const complaintId = complaint._id?.toString();
    const citizenId = normalizeUserId(complaint.citizen);
    const assigneeId = normalizeUserId(complaint.assignedOfficer);
    const recipients = [];

    if (citizenId && isValidObjectId(citizenId)) recipients.push(citizenId);
    if (assigneeId && isValidObjectId(assigneeId) && assigneeId !== citizenId) recipients.push(assigneeId);

    for (const recipientId of recipients) {
      const notification = await createNotification({
        user: recipientId,
        title: "Complaint Resolved",
        message: `Complaint "${complaint.title}" has been resolved.`,
        type: "Complaint Resolved",
        complaint: complaintId,
      });

      if (notification) {
        const recipient = await User.findById(recipientId).select("name email firebaseDeviceTokens");
        await sendEmailForNotification(recipient, "Complaint Resolved", complaint);
        await sendPushToRecipient(
          recipient,
          "Complaint Resolved",
          `Complaint "${complaint.title}" has been resolved.`,
          complaintId,
          "Complaint Resolved"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Complaint resolved notification failed:", error.message);
    return null;
  }
};

const notifyComplaintRejected = async (complaint) => {
  try {
    if (!complaint) return null;

    const complaintId = complaint._id?.toString();
    const citizenId = normalizeUserId(complaint.citizen);
    const assigneeId = normalizeUserId(complaint.assignedOfficer);
    const recipients = [];

    if (citizenId && isValidObjectId(citizenId)) recipients.push(citizenId);
    if (assigneeId && isValidObjectId(assigneeId) && assigneeId !== citizenId) recipients.push(assigneeId);

    for (const recipientId of recipients) {
      const notification = await createNotification({
        user: recipientId,
        title: "Complaint Rejected",
        message: `Complaint "${complaint.title}" has been rejected.`,
        type: "Complaint Rejected",
        complaint: complaintId,
      });

      if (notification) {
        const recipient = await User.findById(recipientId).select("name email firebaseDeviceTokens");
        await sendEmailForNotification(recipient, "Complaint Rejected", complaint);
        await sendPushToRecipient(
          recipient,
          "Complaint Rejected",
          `Complaint "${complaint.title}" has been rejected.`,
          complaintId,
          "Complaint Rejected"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Complaint rejected notification failed:", error.message);
    return null;
  }
};

const notifyComplaintClosed = async (complaint) => {
  try {
    if (!complaint) return null;

    const complaintId = complaint._id?.toString();
    const citizenId = normalizeUserId(complaint.citizen);
    const assigneeId = normalizeUserId(complaint.assignedOfficer);
    const recipients = [];

    if (citizenId && isValidObjectId(citizenId)) recipients.push(citizenId);
    if (assigneeId && isValidObjectId(assigneeId) && assigneeId !== citizenId) recipients.push(assigneeId);

    for (const recipientId of recipients) {
      const notification = await createNotification({
        user: recipientId,
        title: "Complaint Closed",
        message: `Complaint "${complaint.title}" has been closed.`,
        type: "Complaint Closed",
        complaint: complaintId,
      });

      if (notification) {
        const recipient = await User.findById(recipientId).select("name email firebaseDeviceTokens");
        await sendEmailForNotification(recipient, "Complaint Closed", complaint);
        await sendPushToRecipient(
          recipient,
          "Complaint Closed",
          `Complaint "${complaint.title}" has been closed.`,
          complaintId,
          "Complaint Closed"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("Complaint closed notification failed:", error.message);
    return null;
  }
};

module.exports = {
  createNotification,
  notifyComplaintCreated,
  notifyComplaintAssigned,
  notifyComplaintUpdated,
  notifyComplaintResolved,
  notifyComplaintRejected,
  notifyComplaintClosed,
};
