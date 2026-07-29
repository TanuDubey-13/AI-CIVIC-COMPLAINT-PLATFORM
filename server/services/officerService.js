const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");
const {
  notifyComplaintUpdated,
  notifyComplaintResolved,
  createNotification,
} = require("./notificationService");

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const getOfficerDashboard = async (officerId) => {
  const match = { assignedOfficer: mongoose.Types.ObjectId(officerId) };

  const [statusCounts, highPriority, todayCount, recentComplaints, resolvedTimes] = await Promise.all([
    Complaint.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Complaint.countDocuments({ ...match, priority: { $in: ["High", "Critical"] } }),
    (async () => {
      const start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      return Complaint.countDocuments({ ...match, createdAt: { $gte: start, $lt: end } });
    })(),
    Complaint.find(match).sort({ createdAt: -1 }).limit(5).select("title category status priority createdAt").lean(),
    Complaint.aggregate([
      { $match: { ...match, status: "Resolved", resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionTime: {
            $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      { $group: { _id: null, avgResolution: { $avg: "$resolutionTime" } } },
    ]),
  ]);

  const statusMap = (statusCounts || []).reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const avgRes = (resolvedTimes[0] && resolvedTimes[0].avgResolution) ? Math.round((resolvedTimes[0].avgResolution + Number.EPSILON) * 100) / 100 : 0;

  return {
    totalAssigned: Object.values(statusMap).reduce((s, v) => s + v, 0),
    pending: statusMap.Pending || 0,
    inProgress: statusMap["In Progress"] || 0,
    resolved: statusMap.Resolved || 0,
    highPriority: highPriority || 0,
    todaysAssigned: todayCount || 0,
    averageResolutionTime: avgRes,
    recentAssignedComplaints: recentComplaints.map((c) => ({
      title: c.title,
      complaintId: c._id,
      category: c.category,
      status: c.status,
      priority: c.priority,
      createdAt: c.createdAt,
    })),
  };
};

const getOfficerComplaints = async (officerId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { assignedOfficer: mongoose.Types.ObjectId(officerId) };

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } },
    ];
  }
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "citizen", select: "name email phone role" })
      .lean(),
    Complaint.countDocuments(filter),
  ]);

  return {
    complaints: complaints.map((c) => ({
      id: c._id,
      title: c.title,
      category: c.category,
      status: c.status,
      priority: c.priority,
      citizen: c.citizen,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const getComplaintDetailForOfficer = async (complaintId, officerId) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) return null;

  const complaint = await Complaint.findById(complaintId)
    .populate({ path: "citizen", select: "name email phone role" })
    .populate({ path: "assignedOfficer", select: "name email phone role department" })
    .lean();

  if (!complaint) return null;
  if (!complaint.assignedOfficer || complaint.assignedOfficer._id.toString() !== officerId.toString()) return null;

  return complaint;
};

const updateComplaintStatusByOfficer = async (complaintId, officerId, payload) => {
  const { status, resolutionNote } = payload;
  const allowed = ["In Progress", "Resolved", "Rejected"];
  if (!allowed.includes(status)) {
    const err = new Error("Invalid status");
    err.statusCode = 400;
    throw err;
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const err = new Error("Complaint not found");
    err.statusCode = 404;
    throw err;
  }

  if (!complaint.assignedOfficer || complaint.assignedOfficer.toString() !== officerId.toString()) {
    const err = new Error("Not authorized to modify this complaint");
    err.statusCode = 403;
    throw err;
  }

  complaint.status = status;
  if (status === "Resolved") {
    complaint.resolvedAt = new Date();
    if (resolutionNote) {
      complaint.remarks = (complaint.remarks || "") + `\n[Resolution Note by ${officerId} at ${new Date().toISOString()}]: ${resolutionNote}`;
    }
  } else {
    complaint.resolvedAt = null;
  }

  await complaint.save();

  // Notify relevant parties
  if (status === "Resolved") {
    await notifyComplaintResolved(await Complaint.findById(complaint._id).populate("citizen assignedOfficer"));
  } else {
    await notifyComplaintUpdated(await Complaint.findById(complaint._id).populate("citizen assignedOfficer"));
  }

  await createNotification({ user: complaint.citizen, title: "Complaint Updated", message: `Your complaint \"${complaint.title}\" status updated to ${status}.`, type: "Complaint Updated", complaint: complaint._id });

  return complaint;
};

const updateComplaintPriorityByOfficer = async (complaintId, officerId, priority) => {
  const allowed = ["Low", "Medium", "High", "Critical"];
  if (!allowed.includes(priority)) {
    const err = new Error("Invalid priority");
    err.statusCode = 400;
    throw err;
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });
  if (!complaint.assignedOfficer || complaint.assignedOfficer.toString() !== officerId.toString()) throw Object.assign(new Error("Not authorized"), { statusCode: 403 });

  complaint.priority = priority;
  await complaint.save();

  await notifyComplaintUpdated(await Complaint.findById(complaint._id).populate("citizen assignedOfficer"));

  return complaint;
};

const addOfficerNote = async (complaintId, officerId, noteText) => {
  if (!noteText || typeof noteText !== "string") throw Object.assign(new Error("Note is required"), { statusCode: 400 });

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });
  if (!complaint.assignedOfficer || complaint.assignedOfficer.toString() !== officerId.toString()) throw Object.assign(new Error("Not authorized"), { statusCode: 403 });

  complaint.notes = complaint.notes || [];
  complaint.notes.push({ officer: officerId, note: noteText, createdAt: new Date() });
  await complaint.save();

  await notifyComplaintUpdated(await Complaint.findById(complaint._id).populate("citizen assignedOfficer"));

  return complaint;
};

const markLocationVisited = async (complaintId, officerId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });
  if (!complaint.assignedOfficer || complaint.assignedOfficer.toString() !== officerId.toString()) throw Object.assign(new Error("Not authorized"), { statusCode: 403 });

  complaint.visitedAt = new Date();
  complaint.visitedBy = officerId;
  await complaint.save();

  await notifyComplaintUpdated(await Complaint.findById(complaint._id).populate("citizen assignedOfficer"));

  return complaint;
};

const uploadProofImages = async (complaintId, officerId, beforeUrls = [], afterUrls = []) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });
  if (!complaint.assignedOfficer || complaint.assignedOfficer.toString() !== officerId.toString()) throw Object.assign(new Error("Not authorized"), { statusCode: 403 });

  complaint.proofImages = complaint.proofImages || { before: [], after: [] };
  if (Array.isArray(beforeUrls) && beforeUrls.length) complaint.proofImages.before.push(...beforeUrls);
  if (Array.isArray(afterUrls) && afterUrls.length) complaint.proofImages.after.push(...afterUrls);

  await complaint.save();

  await notifyComplaintUpdated(await Complaint.findById(complaint._id).populate("citizen assignedOfficer"));

  return complaint;
};

const getProfile = async (officerId) => {
  const officer = await User.findOne({ _id: officerId, role: "officer" }).select("-password");
  return officer || null;
};

const updateProfile = async (officerId, payload) => {
  const updateData = {};
  if (typeof payload.name === "string" && payload.name.trim()) updateData.name = payload.name.trim();
  if (typeof payload.phone === "string" && payload.phone.trim()) updateData.phone = payload.phone.trim();
  if (typeof payload.profileImage === "string") updateData.profileImage = payload.profileImage;

  const officer = await User.findOneAndUpdate({ _id: officerId, role: "officer" }, updateData, { new: true, runValidators: true }).select("-password");
  return officer;
};

const getPerformance = async (officerId) => {
  const match = { assignedOfficer: mongoose.Types.ObjectId(officerId) };

  const [totalAssigned, totalResolved, highPriorityResolved, resolvedTimes, monthly, weekly] = await Promise.all([
    Complaint.countDocuments(match),
    Complaint.countDocuments({ ...match, status: "Resolved" }),
    Complaint.countDocuments({ ...match, status: "Resolved", priority: { $in: ["High", "Critical"] } }),
    Complaint.aggregate([
      { $match: { ...match, status: "Resolved", resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionTime: { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
        },
      },
      { $group: { _id: null, avgResolution: { $avg: "$resolutionTime" } } },
    ]),
    // monthly performance last 12 months
    (async () => {
      const now = new Date();
      const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
      const result = await Complaint.aggregate([
        { $match: { ...match, createdAt: { $gte: startMonth } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
      return result;
    })(),
    // weekly performance last 7 days
    (async () => {
      const now = new Date();
      const start = new Date();
      start.setUTCDate(now.getUTCDate() - 6);
      start.setUTCHours(0, 0, 0, 0);
      const result = await Complaint.aggregate([
        { $match: { ...match, createdAt: { $gte: start } } },
        { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);
      return result;
    })(),
  ]);

  const avgResolution = (resolvedTimes[0] && resolvedTimes[0].avgResolution) ? Math.round((resolvedTimes[0].avgResolution + Number.EPSILON) * 100) / 100 : 0;
  const resolutionRate = totalAssigned === 0 ? 0 : Math.round(((totalResolved / totalAssigned) * 100 + Number.EPSILON) * 100) / 100;

  return {
    totalAssigned,
    totalResolved,
    resolutionRate,
    averageResolutionTime: avgResolution,
    highPriorityResolved,
    monthlyPerformance: monthly,
    weeklyPerformance: weekly,
  };
};

const getNotifications = async (officerId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: mongoose.Types.ObjectId(officerId) };

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);

  return { notifications, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const markNotificationRead = async (notificationId, officerId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) return null;
  const notification = await Notification.findById(notificationId);
  if (!notification) return null;
  if (notification.user.toString() !== officerId.toString()) return null;
  notification.isRead = true;
  await notification.save();
  return notification;
};

module.exports = {
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
};
