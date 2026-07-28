const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const getPaginationData = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const createNotification = async (req, res) => {
  try {
    const { user, title, message, type, complaint } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const isAdmin = req.user?.role === "admin";
    const targetUser = isAdmin && user ? user : req.user._id;

    const notification = await Notification.create({
      user: targetUser,
      title: title.trim(),
      message: message.trim(),
      type: type || "General",
      complaint: complaint || null,
    });

    const populatedNotification = await Notification.findById(notification._id).populate({
      path: "user",
      select: "name email role",
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: populatedNotification,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating notification",
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "user", select: "name email role" }),
      Notification.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate({
      path: "user",
      select: "name email role",
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (req.user.role !== "admin" && notification.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this notification",
      });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while fetching notification",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (req.user.role !== "admin" && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this notification",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while marking notification as read",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    await Notification.updateMany(filter, { isRead: true });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while marking notifications as read",
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (req.user.role !== "admin" && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    await Notification.deleteMany(filter);

    return res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notifications",
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};
