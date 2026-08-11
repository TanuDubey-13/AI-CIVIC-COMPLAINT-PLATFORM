const express = require("express");
const router = express.Router();
const {
  getAdminDashboard,
  getOfficerDashboard,
  getCitizenDashboard,
  getRecentComplaints,
  getDashboardAnalytics,
  getDashboardActivity,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/officer", protect, authorize("officer"), getOfficerDashboard);
router.get("/citizen", protect, authorize("citizen"), getCitizenDashboard);
router.get("/recent", protect, authorize("admin", "officer", "citizen"), getRecentComplaints);
router.get("/analytics", protect, authorize("admin"), getDashboardAnalytics);
router.get("/activity", protect, authorize("admin", "officer", "citizen"), getDashboardActivity);

module.exports = router;
