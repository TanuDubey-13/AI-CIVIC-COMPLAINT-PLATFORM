const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const Complaint = require("../models/Complaint");

// Helper: upload an in-memory file buffer to Cloudinary
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "civic-complaints", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// @route   POST /api/complaints
// @access  Private (citizen)
const createComplaint = async (req, res) => {
  try {
    const { title, description, location, latitude, longitude, category } = req.body;

    if (!title || !description || !location || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, description, location, latitude, and longitude",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a complaint image",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers",
      });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer);

    // AI categorization/severity is wired up in a later phase (ai-service integration).
    // For now, use a provided category or default placeholders that AI will overwrite.
    const complaint = await Complaint.create({
      title,
      description,
      image: uploadResult.secure_url,
      category: category || "other",
      severity: "low",
      location,
      latitude: lat,
      longitude: lng,
      status: "pending",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating complaint",
    });
  }
};

// @route   GET /api/complaints/my
// @access  Private (citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("department", "name")
      .populate("assignedOfficer", "name email");

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching your complaints",
    });
  }
};

// @route   GET /api/complaints
// @access  Private (officer, admin)
const getAllComplaints = async (req, res) => {
  try {
    const { status, category, severity } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;

    // Officers only see complaints assigned to them; admins see everything
    if (req.user.role === "officer") {
      filter.assignedOfficer = req.user._id;
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email phone")
      .populate("department", "name")
      .populate("assignedOfficer", "name email");

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaints",
    });
  }
};

// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("createdBy", "name email phone")
      .populate("department", "name")
      .populate("assignedOfficer", "name email");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Citizens can only view their own complaints
    const isOwner = complaint.createdBy._id.toString() === req.user._id.toString();
    const isStaff = req.user.role === "officer" || req.user.role === "admin";

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this complaint",
      });
    }

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaint",
    });
  }
};

// @route   PATCH /api/complaints/:id/status
// @access  Private (officer, admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in_progress", "resolved", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Officers can only update complaints assigned to them
    if (
      req.user.role === "officer" &&
      (!complaint.assignedOfficer ||
        complaint.assignedOfficer.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this complaint",
      });
    }

    complaint.status = status;
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Server error while updating complaint status",
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
};