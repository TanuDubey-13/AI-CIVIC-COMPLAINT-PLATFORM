const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: [
        "Complaint Created",
        "Complaint Assigned",
        "Complaint Updated",
        "Complaint Resolved",
        "Complaint Rejected",
        "Complaint Closed",
        "General",
      ],
      default: "General",
    },
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
