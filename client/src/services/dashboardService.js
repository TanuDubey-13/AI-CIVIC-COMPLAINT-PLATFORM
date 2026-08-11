import api from "./api";

export const getDashboardStats = () => api.get("/dashboard");

export const computeStatsFromComplaints = (complaints) => ({
  total: complaints.length,
  pending: complaints.filter((c) => c.status === "pending").length,
  inProgress: complaints.filter((c) => c.status === "in_progress").length,
  resolved: complaints.filter((c) => c.status === "resolved").length,
  byCategory: complaints.reduce((acc, c) => {
    const key = c.category || "other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  bySeverity: complaints.reduce((acc, c) => {
    const key = c.severity || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
  byStatus: complaints.reduce((acc, c) => {
    const key = c.status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
});
