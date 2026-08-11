const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Notification = require("../models/Notification");

const CATEGORY_DEFINITIONS = [
  { key: "Road Damage", label: "Road" },
  { key: "Garbage", label: "Garbage" },
  { key: "Water Leakage", label: "Water" },
  { key: "Street Light", label: "Street Light" },
  { key: "Drainage", label: "Drainage" },
  { key: "Electricity", label: "Electricity" },
  { key: "Sewage", label: "Sewage" },
  { key: "Other", label: "Others" },
];

const STATUS_VALUES = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"];
const PRIORITY_ORDER = ["Critical", "High", "Medium", "Low"];
const ACTIVITY_TYPES = [
  "Complaint Created",
  "Complaint Assigned",
  "Complaint Updated",
  "Complaint Resolved",
];

const getUtcRangeForDay = (date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0));
  return { start, end };
};

const getUtcRangeForMonth = (date) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  return { start, end };
};

const roundToTwo = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const formatCategoryDistribution = (counts) => {
  return CATEGORY_DEFINITIONS.map((definition) => ({
    category: definition.label,
    count: counts.find((item) => item._id === definition.key)?.count || 0,
  }));
};

const formatStatusCounts = (counts) => {
  return STATUS_VALUES.reduce((acc, status) => {
    acc[status.replace(/ /g, "")] = counts.find((item) => item._id === status)?.count || 0;
    return acc;
  }, {});
};

const getAdminDashboardData = async () => {
  const now = new Date();
  const { start: todayStart, end: todayEnd } = getUtcRangeForDay(now);
  const { start: monthStart, end: monthEnd } = getUtcRangeForMonth(now);
  const previousMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1));
  const previousMonthEnd = monthStart;

  const [totalUsers, totalCitizens, totalOfficers, complaintFacet] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "citizen" }),
    User.countDocuments({ role: "officer" }),
    Complaint.aggregate([
      {
        $facet: {
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          totalComplaints: [{ $count: "count" }],
          todayComplaints: [
            { $match: { createdAt: { $gte: todayStart, $lt: todayEnd } } },
            { $count: "count" },
          ],
          thisMonthComplaints: [
            { $match: { createdAt: { $gte: monthStart, $lt: monthEnd } } },
            { $count: "count" },
          ],
          previousMonthComplaints: [
            { $match: { createdAt: { $gte: previousMonth, $lt: previousMonthEnd } } },
            { $count: "count" },
          ],
          resolvedTimes: [
            { $match: { status: "Resolved", resolvedAt: { $ne: null } } },
            {
              $project: {
                resolutionTime: {
                  $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
                },
              },
            },
            { $group: { _id: null, averageResolutionTime: { $avg: "$resolutionTime" } } },
          ],
        },
      },
    ]),
  ]);

  const facet = complaintFacet[0] || {};
  const statusCounts = facet.statusCounts || [];
  const resolvedTimeRecord = facet.resolvedTimes?.[0] || {};
  const averageResolutionTime = resolvedTimeRecord.averageResolutionTime ? roundToTwo(resolvedTimeRecord.averageResolutionTime) : 0;
  const currentMonthCount = facet.thisMonthComplaints?.[0]?.count || 0;
  const previousMonthCount = facet.previousMonthComplaints?.[0]?.count || 0;
  const growthPercentage = previousMonthCount === 0
    ? currentMonthCount === 0
      ? 0
      : 100
    : roundToTwo(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100);

  const statusCountsObject = {
    pending: statusCounts.find((item) => item._id === "Pending")?.count || 0,
    assigned: statusCounts.find((item) => item._id === "Assigned")?.count || 0,
    inProgress: statusCounts.find((item) => item._id === "In Progress")?.count || 0,
    resolved: statusCounts.find((item) => item._id === "Resolved")?.count || 0,
    rejected: statusCounts.find((item) => item._id === "Rejected")?.count || 0,
  };

  return {
    totalUsers,
    totalCitizens,
    totalOfficers,
    totalComplaints: facet.totalComplaints?.[0]?.count || 0,
    pendingComplaints: statusCountsObject.pending,
    inProgressComplaints: statusCountsObject.inProgress,
    assignedComplaints: statusCountsObject.assigned,
    resolvedComplaints: statusCountsObject.resolved,
    rejectedComplaints: statusCountsObject.rejected,
    todaysComplaints: facet.todayComplaints?.[0]?.count || 0,
    thisMonthComplaints: currentMonthCount,
    averageResolutionTime,
    complaintGrowthPercentage: growthPercentage,
  };
};

const getOfficerDashboardData = async (userId) => {
  const matchAssigned = { assignedOfficer: userId };
  const [statusCounts, resolvedTimes, recentComplaints, highPriorityComplaints] = await Promise.all([
    Complaint.aggregate([
      { $match: matchAssigned },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Complaint.aggregate([
      { $match: { ...matchAssigned, status: "Resolved", resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionTime: {
            $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      { $group: { _id: null, averageResolutionTime: { $avg: "$resolutionTime" } } },
    ]),
    Complaint.find(matchAssigned)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category status priority createdAt")
      .lean(),
    Complaint.aggregate([
      { $match: { ...matchAssigned, priority: { $in: ["Critical", "High"] } } },
      {
        $addFields: {
          priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "Critical"] }, then: 4 },
                { case: { $eq: ["$priority", "High"] }, then: 3 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "Low"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityOrder: -1, createdAt: -1 } },
      { $limit: 5 },
      { $project: { title: 1, category: 1, status: 1, priority: 1, createdAt: 1 } },
    ]),
  ]);

  const resolvedTimeRecord = resolvedTimes[0] || {};
  const averageResolutionTime = resolvedTimeRecord.averageResolutionTime ? roundToTwo(resolvedTimeRecord.averageResolutionTime) : 0;

  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalAssignedComplaints: statusCounts.reduce((sum, item) => sum + item.count, 0),
    pending: statusMap.Pending || 0,
    assigned: statusMap.Assigned || 0,
    inProgress: statusMap["In Progress"] || 0,
    resolved: statusMap.Resolved || 0,
    rejected: statusMap.Rejected || 0,
    averageResolutionTime,
    recentAssignedComplaints: recentComplaints.map((complaint) => ({
      title: complaint.title,
      complaintId: complaint._id,
      category: complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      createdAt: complaint.createdAt,
    })),
    highPriorityComplaints: highPriorityComplaints.map((complaint) => ({
      title: complaint.title,
      complaintId: complaint._id,
      category: complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      createdAt: complaint.createdAt,
    })),
  };
};

const getCitizenDashboardData = async (userId) => {
  const [result] = await Complaint.aggregate([
    { $match: { citizen: userId } },
    {
      $facet: {
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        categoryCounts: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
        recentComplaints: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: { title: 1, status: 1, category: 1, priority: 1, createdAt: 1 } },
        ],
        latestComplaint: [
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { status: 1 } },
        ],
      },
    },
  ]);

  const statusCounts = result?.statusCounts || [];
  const categoryCounts = result?.categoryCounts || [];
  const latestComplaint = result?.latestComplaint?.[0] || null;
  const statusMap = statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  return {
    totalComplaintsSubmitted: statusCounts.reduce((sum, item) => sum + item.count, 0),
    pending: statusMap.Pending || 0,
    inProgress: statusMap["In Progress"] || 0,
    resolved: statusMap.Resolved || 0,
    rejected: statusMap.Rejected || 0,
    recentComplaints: (result?.recentComplaints || []).map((complaint) => ({
      title: complaint.title,
      complaintId: complaint._id,
      category: complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      createdAt: complaint.createdAt,
    })),
    latestComplaintStatus: latestComplaint?.status || null,
    categoryDistribution: formatCategoryDistribution(categoryCounts),
  };
};

const getRecentComplaintsData = async () => {
  const complaints = await Complaint.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("title category status priority createdAt")
    .lean();

  return complaints.map((complaint) => ({
    title: complaint.title,
    complaintId: complaint._id,
    category: complaint.category,
    status: complaint.status,
    priority: complaint.priority,
    createdAt: complaint.createdAt,
  }));
};

const getAnalyticsData = async () => {
  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1, 0, 0, 0, 0));

  const [result] = await Complaint.aggregate([
    {
      $facet: {
        categoryCounts: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
        statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        priorityCounts: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
        monthlyCounts: [
          { $match: { createdAt: { $gte: startMonth } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
      },
    },
  ]);

  const monthlyCounts = result?.monthlyCounts || [];
  const months = [];

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const label = date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
    const count = monthlyCounts.find((item) => item._id.year === year && item._id.month === month)?.count || 0;
    months.push({ month: label, year, count });
  }

  return {
    categoryWise: formatCategoryDistribution(result?.categoryCounts || []),
    statusWise: STATUS_VALUES.map((status) => ({
      status,
      count: result?.statusCounts?.find((item) => item._id === status)?.count || 0,
    })),
    monthlyComplaints: months,
    priorityDistribution: PRIORITY_ORDER.map((priority) => ({
      priority,
      count: result?.priorityCounts?.find((item) => item._id === priority)?.count || 0,
    })),
  };
};

const getRecentActivityData = async () => {
  const notifications = await Notification.find({ type: { $in: ACTIVITY_TYPES } })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("type title message complaint createdAt")
    .lean();

  return notifications.map((notification) => ({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    complaintId: notification.complaint,
    createdAt: notification.createdAt,
  }));
};

module.exports = {
  getAdminDashboardData,
  getOfficerDashboardData,
  getCitizenDashboardData,
  getRecentComplaintsData,
  getAnalyticsData,
  getRecentActivityData,
};
