const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserById,
  removeUser,
  blockUser,
  unblockUser,
  createOfficerAccount,
  getAllOfficers,
  getOfficer,
  updateOfficerById,
  removeOfficer,
  getAllComplaints,
  getComplaintDetails,
  assignComplaint,
  updateComplaintStatusById,
  removeComplaint,
  getStatistics,
  getRecentUsersList,
  getRecentComplaintsList,
  getSystemHealthReport,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUserById);
router.delete("/users/:id", removeUser);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);

// Officer management
router.post("/officers", createOfficerAccount);
router.get("/officers", getAllOfficers);
router.get("/officers/:id", getOfficer);
router.put("/officers/:id", updateOfficerById);
router.delete("/officers/:id", removeOfficer);

// Complaint management
router.get("/complaints", getAllComplaints);
router.get("/complaints/:id", getComplaintDetails);
router.put("/complaints/:id/assign", assignComplaint);
router.put("/complaints/:id/status", updateComplaintStatusById);
router.delete("/complaints/:id", removeComplaint);

// Dashboard admin reports
router.get("/statistics", getStatistics);
router.get("/recent-users", getRecentUsersList);
router.get("/recent-complaints", getRecentComplaintsList);
router.get("/system-health", getSystemHealthReport);

module.exports = router;
