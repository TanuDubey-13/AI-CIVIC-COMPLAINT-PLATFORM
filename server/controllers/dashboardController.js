const {
  getAdminDashboardData,
  getOfficerDashboardData,
  getCitizenDashboardData,
  getRecentComplaintsData,
  getAnalyticsData,
  getRecentActivityData,
} = require("../services/dashboardService");

// Get admin dashboard summary metrics.
const getAdminDashboard = async (req, res) => {
  try {
    const metrics = await getAdminDashboardData();

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin dashboard data",
    });
  }
};

// Get officer dashboard summary metrics for the authenticated officer.
const getOfficerDashboard = async (req, res) => {
  try {
    const metrics = await getOfficerDashboardData(req.user._id);

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching officer dashboard data",
    });
  }
};

// Get citizen dashboard summary metrics for the authenticated citizen.
const getCitizenDashboard = async (req, res) => {
  try {
    const metrics = await getCitizenDashboardData(req.user._id);

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching citizen dashboard data",
    });
  }
};

// Get latest 10 complaints for the dashboard.
const getRecentComplaints = async (req, res) => {
  try {
    const complaints = await getRecentComplaintsData();

    return res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching recent complaints",
    });
  }
};

// Get analytics data for the dashboard.
const getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalyticsData();

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics data",
    });
  }
};

// Get recent activity feed for dashboard.
const getDashboardActivity = async (req, res) => {
  try {
    const activities = await getRecentActivityData();

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard activity",
    });
  }
};

module.exports = {
  getAdminDashboard,
  getOfficerDashboard,
  getCitizenDashboard,
  getRecentComplaints,
  getDashboardAnalytics,
  getDashboardActivity,
};
