const mongoose = require("mongoose");
const User = require("../models/User");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  department: user.department || "",
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildComplaintResponse = (complaint) => ({
  id: complaint._id,
  title: complaint.title,
  description: complaint.description,
  category: complaint.category,
  priority: complaint.priority,
  status: complaint.status,
  department: complaint.department,
  citizen: complaint.citizen,
  assignedOfficer: complaint.assignedOfficer,
  createdAt: complaint.createdAt,
  updatedAt: complaint.updatedAt,
  resolvedAt: complaint.resolvedAt,
});

const getUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (query.role) {
    filter.role = query.role;
  }

  if (query.isActive !== undefined) {
    const isActive = query.isActive === "true" || query.isActive === "1";
    filter.isActive = isActive;
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map(buildUserResponse),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const getUserDetail = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id);
  return user ? buildUserResponse(user) : null;
};

const updateUser = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateData = {};

  if (typeof payload.name === "string" && payload.name.trim()) {
    updateData.name = payload.name.trim();
  }

  if (typeof payload.phone === "string" && payload.phone.trim()) {
    updateData.phone = payload.phone.trim();
  }

  if (typeof payload.role === "string" && ["citizen", "officer", "admin"].includes(payload.role)) {
    updateData.role = payload.role;
  }

  if (payload.isActive !== undefined) {
    updateData.isActive = payload.isActive === true || payload.isActive === "true" || payload.isActive === "1";
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  return user ? buildUserResponse(user) : null;
};

const deleteUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const deleted = await User.findByIdAndDelete(id);
  return Boolean(deleted);
};

const setUserActiveStatus = async (id, isActive) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true, runValidators: true });
  return user ? buildUserResponse(user) : null;
};

const createOfficer = async (payload) => {
  const { name, email, password, phone, department } = payload;
  if (!name || !email || !password || !phone) {
    throw new Error("Name, email, password, and phone are required to create an officer.");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: phone.trim(),
    role: "officer",
    department: typeof department === "string" ? department.trim() : "",
    isActive: true,
  });

  return buildUserResponse(user);
};

const getOfficers = async () => {
  const officers = await User.find({ role: "officer" }).sort({ createdAt: -1 });
  return officers.map(buildUserResponse);
};

const getOfficerById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const officer = await User.findOne({ _id: id, role: "officer" });
  return officer ? buildUserResponse(officer) : null;
};

const updateOfficer = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateData = {};

  if (typeof payload.name === "string" && payload.name.trim()) {
    updateData.name = payload.name.trim();
  }

  if (typeof payload.phone === "string" && payload.phone.trim()) {
    updateData.phone = payload.phone.trim();
  }

  if (typeof payload.department === "string") {
    updateData.department = payload.department.trim();
  }

  const officer = await User.findOneAndUpdate(
    { _id: id, role: "officer" },
    updateData,
    { new: true, runValidators: true }
  );

  return officer ? buildUserResponse(officer) : null;
};

const deleteOfficer = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const deleted = await User.findOneAndDelete({ _id: id, role: "officer" });
  return Boolean(deleted);
};

const getComplaints = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "citizen", select: "name email phone role" })
      .populate({ path: "assignedOfficer", select: "name email phone role department" }),
    Complaint.countDocuments(filter),
  ]);

  return {
    complaints: complaints.map(buildComplaintResponse),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const getComplaintById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const complaint = await Complaint.findById(id)
    .populate({ path: "citizen", select: "name email phone role" })
    .populate({ path: "assignedOfficer", select: "name email phone role department" });

  return complaint ? buildComplaintResponse(complaint) : null;
};

const assignComplaintToOfficer = async (complaintId, officerId) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId) || !mongoose.Types.ObjectId.isValid(officerId)) {
    return null;
  }

  const officer = await User.findOne({ _id: officerId, role: "officer", isActive: true });
  if (!officer) {
    const error = new Error("Officer not found or not active.");
    error.statusCode = 404;
    throw error;
  }

  const complaint = await Complaint.findByIdAndUpdate(
    complaintId,
    {
      assignedOfficer: officer._id,
      status: "In Progress",
    },
    { new: true, runValidators: true }
  );

  return complaint ? buildComplaintResponse(complaint) : null;
};

const updateComplaintStatus = async (complaintId, status) => {
  const validStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];

  if (!mongoose.Types.ObjectId.isValid(complaintId) || !validStatuses.includes(status)) {
    return null;
  }

  const updateData = { status };
  if (status === "Resolved") {
    updateData.resolvedAt = new Date();
  } else {
    updateData.resolvedAt = null;
  }

  const complaint = await Complaint.findByIdAndUpdate(complaintId, updateData, {
    new: true,
    runValidators: true,
  });

  return complaint ? buildComplaintResponse(complaint) : null;
};

const deleteComplaint = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const removed = await Complaint.findByIdAndDelete(id);
  return Boolean(removed);
};

const getAdminStatistics = async () => {
  const [totalUsers, totalOfficers, totalCitizens, statusCounts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "officer" }),
    User.countDocuments({ role: "citizen" }),
    Complaint.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const mapStatus = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalUsers,
    totalOfficers,
    totalCitizens,
    totalComplaints: statusCounts.reduce((sum, item) => sum + item.count, 0),
    pending: mapStatus.Pending || 0,
    inProgress: mapStatus["In Progress"] || 0,
    resolved: mapStatus.Resolved || 0,
    rejected: mapStatus.Rejected || 0,
  };
};

const getRecentUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 }).limit(10);
  return users.map(buildUserResponse);
};

const getRecentComplaints = async () => {
  const complaints = await Complaint.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({ path: "citizen", select: "name email phone role" })
    .populate({ path: "assignedOfficer", select: "name email phone role department" });

  return complaints.map(buildComplaintResponse);
};

const getSystemHealth = async () => {
  const memoryUsage = process.memoryUsage();

  return {
    mongoConnected: mongoose.connection.readyState === 1,
    serverUptime: process.uptime(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
    memoryUsage: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
  };
};

const createActivityLog = async ({ user, title, message, type, complaint = null }) => {
  try {
    if (!user || !title || !message) {
      return null;
    }

    const log = await Notification.create({
      user,
      title,
      message,
      type,
      complaint,
    });

    return log;
  } catch (error) {
    console.error("Admin activity log creation failed:", error.message);
    return null;
  }
};

module.exports = {
  getUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  setUserActiveStatus,
  createOfficer,
  getOfficers,
  getOfficerById,
  updateOfficer,
  deleteOfficer,
  getComplaints,
  getComplaintById,
  assignComplaintToOfficer,
  updateComplaintStatus,
  deleteComplaint,
  getAdminStatistics,
  getRecentUsers,
  getRecentComplaints,
  getSystemHealth,
  createActivityLog,
};
