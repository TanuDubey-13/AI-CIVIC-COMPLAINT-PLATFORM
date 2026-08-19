const streamifier = require("streamifier");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const Complaint = require("../models/Complaint");
const {
  notifyComplaintCreated,
  notifyComplaintAssigned,
  notifyComplaintUpdated,
  notifyComplaintResolved,
  notifyComplaintRejected,
  notifyComplaintClosed,
} = require("../services/notificationService");

const VALID_CATEGORIES = [
  "Road Damage",
  "Garbage",
  "Water Leakage",
  "Street Light",
  "Drainage",
  "Electricity",
  "Sewage",
  "Other",
];

const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const VALID_STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"];

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

const buildComplaintQuery = (query) => {
  const filter = {};
  const { status, category, priority, search } = query;

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { remarks: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
};

const getPaginationData = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getComplaintPopulate = (query = {}) => {
  const basePopulate = [
    { path: "citizen", select: "name email phone role" },
    { path: "assignedOfficer", select: "name email phone role" },
  ];

  if (query.includeDepartment !== false) {
    basePopulate.push({ path: "department", select: "name" });
  }

  return basePopulate;
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, location, category, priority, department, remarks } = req.body;

    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    const normalizedDescription = typeof description === "string" ? description.trim() : "";

    if (!normalizedTitle || !normalizedDescription || !location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and location are required",
      });
    }

    if (normalizedTitle.length < 5 || normalizedTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 5 and 100 characters",
      });
    }

    if (normalizedDescription.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 20 characters",
      });
    }

    if (typeof location !== "object" || Array.isArray(location) || location === null) {
      return res.status(400).json({
        success: false,
        message: "Location must be a valid object",
      });
    }

    const normalizedCategory = VALID_CATEGORIES.includes(category) ? category : "Other";
    const normalizedPriority = VALID_PRIORITIES.includes(priority) ? priority : "Medium";

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
        imageUrl = uploadResult.secure_url;
        imagePublicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload complaint image. Please try again later.",
        });
      }
    }

    const complaint = await Complaint.create({
      title: normalizedTitle,
      description: normalizedDescription,
      image: imageUrl,
      imagePublicId,
      location: {
        address: typeof location.address === "string" ? location.address.trim() : "",
        latitude: location.latitude !== undefined ? Number(location.latitude) : null,
        longitude: location.longitude !== undefined ? Number(location.longitude) : null,
      },
      category: normalizedCategory,
      priority: normalizedPriority,
      status: "Pending",
      citizen: req.user._id,
      department: typeof department === "string" ? department.trim() : "",
      remarks: typeof remarks === "string" ? remarks.trim() : "",
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate(getComplaintPopulate());
    await notifyComplaintCreated(populatedComplaint);

    return res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint: populatedComplaint,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating complaint",
    });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .sort({ createdAt: -1 })
      .populate(getComplaintPopulate());

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

const getAllComplaints = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationData(req.query);
    const filter = buildComplaintQuery(req.query);
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    if (req.user.role === "officer") {
      filter.assignedOfficer = req.user._id;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate(getComplaintPopulate()),
      Complaint.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaints",
    });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(getComplaintPopulate());

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const isOwner = complaint.citizen && complaint.citizen._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isAssignedOfficer =
      req.user.role === "officer" &&
      complaint.assignedOfficer &&
      complaint.assignedOfficer.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isAssignedOfficer) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this complaint",
      });
    }

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaint",
    });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const isOwner = complaint.citizen.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isOfficer = req.user.role === "officer";

    if (!isAdmin && !isOfficer && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this complaint",
      });
    }

    const adminFields = ["title", "description", "status", "priority", "assignedOfficer", "remarks"];
    const officerFields = ["status", "assignedOfficer", "remarks"];
    const allowedFields = isAdmin ? adminFields : officerFields;
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "title") {
          const value = typeof req.body.title === "string" ? req.body.title.trim() : "";
          if (value.length < 5 || value.length > 100) {
            return res.status(400).json({
              success: false,
              message: "Title must be between 5 and 100 characters",
            });
          }
          updateData.title = value;
        } else if (field === "description") {
          const value = typeof req.body.description === "string" ? req.body.description.trim() : "";
          if (value.length < 20) {
            return res.status(400).json({
              success: false,
              message: "Description must be at least 20 characters",
            });
          }
          updateData.description = value;
        } else if (field === "status") {
          if (!VALID_STATUSES.includes(req.body.status)) {
            return res.status(400).json({
              success: false,
              message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
            });
          }
          updateData.status = req.body.status;
        } else if (field === "priority") {
          if (!VALID_PRIORITIES.includes(req.body.priority)) {
            return res.status(400).json({
              success: false,
              message: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}`,
            });
          }
          updateData.priority = req.body.priority;
        } else if (field === "assignedOfficer") {
          if (req.body.assignedOfficer === null || req.body.assignedOfficer === "") {
            updateData.assignedOfficer = null;
          } else if (!mongoose.Types.ObjectId.isValid(req.body.assignedOfficer)) {
            return res.status(400).json({
              success: false,
              message: "assignedOfficer must be a valid user ID",
            });
          } else {
            updateData.assignedOfficer = req.body.assignedOfficer;
          }
        } else if (field === "remarks") {
          updateData.remarks = typeof req.body.remarks === "string" ? req.body.remarks.trim() : "";
        }
      }
    }

    if (isOfficer) {
      const restrictedFields = ["title", "description", "priority"];
      const attemptedRestrictedField = restrictedFields.find((field) => Object.prototype.hasOwnProperty.call(req.body, field));

      if (attemptedRestrictedField) {
        return res.status(403).json({
          success: false,
          message: "Officers can only update complaint status, assignment, and remarks",
        });
      }
    }

    if (updateData.status === "Resolved") {
      updateData.resolvedAt = new Date();
    } else if (updateData.status && updateData.status !== "Resolved") {
      updateData.resolvedAt = null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const previousStatus = complaint.status;
    const previousAssignedOfficer = complaint.assignedOfficer;

    const updatedComplaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate(getComplaintPopulate());

    if (updatedComplaint) {
      if (updatedComplaint.status === "Resolved") {
        await notifyComplaintResolved(updatedComplaint);
      } else if (updatedComplaint.status === "Rejected") {
        await notifyComplaintRejected(updatedComplaint);
      } else if (updatedComplaint.status === "Closed") {
        await notifyComplaintClosed(updatedComplaint);
      } else if (
        previousAssignedOfficer?.toString() !== updatedComplaint.assignedOfficer?.toString() ||
        previousStatus !== updatedComplaint.status
      ) {
        await notifyComplaintAssigned(updatedComplaint);
      } else {
        await notifyComplaintUpdated(updatedComplaint);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint: updatedComplaint,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating complaint",
    });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const isOwner = complaint.citizen.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this complaint",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    if (complaint.imagePublicId) {
      cloudinary.uploader
        .destroy(complaint.imagePublicId, { resource_type: "image" })
        .catch((destroyError) => {
          console.error("Cloudinary cleanup failed for deleted complaint image:", destroyError);
        });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while deleting complaint",
    });
  }
};

const getComplaintStatistics = async (req, res) => {
  try {
    const [statusStats, categoryStats, priorityStats, totalComplaints] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Complaint.countDocuments(),
    ]);

    const stats = {
      totalComplaints,
      pending: statusStats.find((item) => item._id === "Pending")?.count || 0,
      assigned: statusStats.find((item) => item._id === "Assigned")?.count || 0,
      resolved: statusStats.find((item) => item._id === "Resolved")?.count || 0,
      rejected: statusStats.find((item) => item._id === "Rejected")?.count || 0,
      categoryWise: categoryStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      priorityWise: priorityStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching complaint statistics",
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getComplaintStatistics,
};