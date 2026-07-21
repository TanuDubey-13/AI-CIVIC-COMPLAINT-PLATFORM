const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require("../controllers/complaintController");

const { protect, authorize } = require("../middleware/auth");
const { uploadComplaintImage } = require("../middleware/upload");

// @route   POST /api/complaints
// @desc    Citizen submits a new complaint with image
router.post("/", protect, uploadComplaintImage, createComplaint);

// @route   GET /api/complaints/my
// @desc    Citizen views their own complaint history
router.get("/my", protect, getMyComplaints);

// @route   GET /api/complaints
// @desc    Officer/Admin views complaints (filtered by role)
router.get("/", protect, authorize("officer", "admin"), getAllComplaints);

// @route   GET /api/complaints/:id
// @desc    View a single complaint (owner or staff only)
router.get("/:id", protect, getComplaintById);

// @route   PATCH /api/complaints/:id/status
// @desc    Officer/Admin updates complaint status
router.patch("/:id/status", protect, authorize("officer", "admin"), updateComplaintStatus);

module.exports = router;