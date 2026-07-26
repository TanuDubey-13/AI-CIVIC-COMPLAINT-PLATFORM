const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStatistics,
} = require("../controllers/complaintController");

const { protect, authorize } = require("../middleware/auth");
const { uploadComplaintImage } = require("../middleware/upload");

router.post("/create", protect, authorize("citizen"), uploadComplaintImage, createComplaint);
router.get("/my", protect, authorize("citizen"), getMyComplaints);
router.get("/stats", protect, authorize("admin"), getComplaintStatistics);
router.get("/", protect, authorize("admin", "officer"), getAllComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id", protect, authorize("officer", "admin"), updateComplaint);
router.delete("/:id", protect, authorize("admin"), deleteComplaint);

module.exports = router;