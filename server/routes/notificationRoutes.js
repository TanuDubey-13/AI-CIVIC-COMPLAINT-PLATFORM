const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.post("/create", protect, createNotification);
router.get("/", protect, getNotifications);
router.get("/:id", protect, getNotificationById);
router.put("/:id/read", protect, markNotificationAsRead);
router.put("/read-all", protect, markAllNotificationsAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/delete-all", protect, deleteAllNotifications);

module.exports = router;
