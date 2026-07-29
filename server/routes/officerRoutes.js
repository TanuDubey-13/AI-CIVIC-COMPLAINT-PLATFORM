const express = require("express");
const router = express.Router();
const {
  officerDashboard,
  listComplaints,
  getComplaint,
  updateStatus,
  updatePriority,
  addNote,
  markVisited,
  uploadProof,
  getOfficerProfile,
  updateOfficerProfile,
  officerPerformance,
  listNotifications,
  markNotification,
} = require("../controllers/officerController");
const { protect, authorize } = require("../middleware/auth");
const { uploadComplaintImage } = require("../middleware/upload");

router.use(protect, authorize("officer"));

router.get("/dashboard", officerDashboard);

// Complaints
router.get("/complaints", listComplaints);
router.get("/complaints/:id", getComplaint);
router.put("/complaints/:id/status", updateStatus);
router.put("/complaints/:id/priority", updatePriority);
router.put("/complaints/:id/note", addNote);
router.put("/complaints/:id/location-visit", markVisited);
router.put("/complaints/:id/upload-proof", uploadProof);

// Profile
router.get("/profile", getOfficerProfile);
router.put("/profile", uploadComplaintImage, updateOfficerProfile);

// Performance
router.get("/performance", officerPerformance);

// Notifications
router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", markNotification);

module.exports = router;
