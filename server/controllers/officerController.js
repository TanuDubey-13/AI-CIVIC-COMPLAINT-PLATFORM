const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const {
  getOfficerDashboard,
  getOfficerComplaints,
  getComplaintDetailForOfficer,
  updateComplaintStatusByOfficer,
  updateComplaintPriorityByOfficer,
  addOfficerNote,
  markLocationVisited,
  uploadProofImages,
  getProfile,
  updateProfile,
  getPerformance,
  getNotifications,
  markNotificationRead,
} = require("../services/officerService");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// helper to upload buffer to cloudinary and return secure_url
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: "civic-complaints/proofs", resource_type: "image" }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// GET /api/officer/dashboard
// Returns dashboard metrics for logged-in officer.
const officerDashboard = async (req, res) => {
  try {
    const data = await getOfficerDashboard(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching dashboard." });
  }
};

// GET /api/officer/complaints
// Returns list of complaints assigned to officer with filters
const listComplaints = async (req, res) => {
  try {
    const data = await getOfficerComplaints(req.user._id, req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching complaints." });
  }
};

// GET /api/officer/complaints/:id
// Return complaint details assigned to the officer
const getComplaint = async (req, res) => {
  try {
    const complaint = await getComplaintDetailForOfficer(req.params.id, req.user._id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found or not assigned to you." });
    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    return res.status(500).json({ success: false, message: "Server error while fetching complaint." });
  }
};

// PUT /api/officer/complaints/:id/status
const updateStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    const updated = await updateComplaintStatusByOfficer(req.params.id, req.user._id, { status, resolutionNote });
    return res.status(200).json({ success: true, message: "Status updated.", complaint: updated });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message || "Server error while updating status." });
  }
};

// PUT /api/officer/complaints/:id/priority
const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const updated = await updateComplaintPriorityByOfficer(req.params.id, req.user._id, priority);
    return res.status(200).json({ success: true, message: "Priority updated.", complaint: updated });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message || "Server error while updating priority." });
  }
};

// PUT /api/officer/complaints/:id/note
const addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || typeof note !== "string") return res.status(400).json({ success: false, message: "Note is required." });
    const updated = await addOfficerNote(req.params.id, req.user._id, note);
    return res.status(200).json({ success: true, message: "Note added.", complaint: updated });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message || "Server error while adding note." });
  }
};

// PUT /api/officer/complaints/:id/location-visit
const markVisited = async (req, res) => {
  try {
    const updated = await markLocationVisited(req.params.id, req.user._id);
    return res.status(200).json({ success: true, message: "Marked as visited.", complaint: updated });
  } catch (error) {
    const code = error.statusCode || 500;
    return res.status(code).json({ success: false, message: error.message || "Server error while marking visit." });
  }
};

// PUT /api/officer/complaints/:id/upload-proof
// Accepts multipart form-data: before (multiple), after (multiple)
const uploadProof = async (req, res) => {
  const uploader = upload.fields([{ name: "before", maxCount: 5 }, { name: "after", maxCount: 5 }]);

  uploader(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ success: false, message: err.message });

      const beforeFiles = (req.files && req.files.before) || [];
      const afterFiles = (req.files && req.files.after) || [];

      const beforeUrls = [];
      const afterUrls = [];

      for (const file of beforeFiles) {
        const url = await uploadBufferToCloudinary(file.buffer);
        beforeUrls.push(url);
      }

      for (const file of afterFiles) {
        const url = await uploadBufferToCloudinary(file.buffer);
        afterUrls.push(url);
      }

      const updated = await uploadProofImages(req.params.id, req.user._id, beforeUrls, afterUrls);
      return res.status(200).json({ success: true, message: "Proof images uploaded.", complaint: updated });
    } catch (error) {
      const code = error.statusCode || 500;
      return res.status(code).json({ success: false, message: error.message || "Server error while uploading proof." });
    }
  });
};

// GET /api/officer/profile
const getOfficerProfile = async (req, res) => {
  try {
    const profile = await getProfile(req.user._id);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching profile." });
  }
};

// PUT /api/officer/profile
const updateOfficerProfile = async (req, res) => {
  try {
    const payload = { name: req.body.name, phone: req.body.phone };

    if (req.file && req.file.buffer) {
      const url = await uploadBufferToCloudinary(req.file.buffer);
      payload.profileImage = url;
    }

    const updated = await updateProfile(req.user._id, payload);
    return res.status(200).json({ success: true, message: "Profile updated.", profile: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while updating profile." });
  }
};

// GET /api/officer/performance
const officerPerformance = async (req, res) => {
  try {
    const data = await getPerformance(req.user._id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching performance." });
  }
};

// GET /api/officer/notifications
const listNotifications = async (req, res) => {
  try {
    const data = await getNotifications(req.user._id, req.query);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching notifications." });
  }
};

// PATCH /api/officer/notifications/:id/read
const markNotification = async (req, res) => {
  try {
    const updated = await markNotificationRead(req.params.id, req.user._id);
    if (!updated) return res.status(404).json({ success: false, message: "Notification not found or not owned by you." });
    return res.status(200).json({ success: true, message: "Notification marked as read.", notification: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while marking notification." });
  }
};

module.exports = {
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
};
