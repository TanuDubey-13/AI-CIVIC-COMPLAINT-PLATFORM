import { useEffect, useState, useMemo } from "react";
import { getAllComplaints, updateStatus } from "../services/adminService";
import ComplaintChart from "../components/Charts/ComplaintChart";
import { formatCategory, groupAndCount } from "../utils/formatters";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", severity: "", category: "" });
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const res = await getAllComplaints(activeFilters);
      setComplaints(res.data.complaints || []);
    } catch {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateStatus(id, status);
      loadComplaints();
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }), [complaints]);

  const categoryData = useMemo(() => groupAndCount(complaints, "category"), [complaints]);
  const severityData = useMemo(() => groupAndCount(complaints, "severity"), [complaints]);
  const statusData = useMemo(() => groupAndCount(complaints, "status"), [complaints]);

  if (loading && complaints.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage and monitor all civic complaints</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Complaints by Category</h3>
          <ComplaintChart data={categoryData} color="#2563eb" />
        </div>
        <div className="chart-card">
          <h3>Complaints by Severity</h3>
          <ComplaintChart data={severityData} color="#d97706" />
        </div>
        <div className="chart-card">
          <h3>Complaints by Status</h3>
          <ComplaintChart data={statusData} color="#059669" />
        </div>
      </div>

      <div className="filters-bar">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          <option value="road_damage">Road Damage</option>
          <option value="streetlight">Street Light</option>
          <option value="garbage">Garbage</option>
          <option value="water_leakage">Water Leakage</option>
          <option value="other">Other</option>
        </select>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <h3>No complaints found</h3>
          <p>No complaints match the current filters.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td>
                    <img src={complaint.image} alt={complaint.title} className="table-thumb" />
                  </td>
                  <td style={{ fontWeight: 600 }}>{complaint.title}</td>
                  <td>{formatCategory(complaint.category)}</td>
                  <td>
                    <span className={`badge badge-${complaint.severity}`}>{complaint.severity}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${complaint.status}`}>
                      {complaint.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>{complaint.department?.name || "—"}</td>
                  <td>
                    <select
                      className="status-select"
                      value={complaint.status}
                      disabled={updating === complaint._id}
                      onChange={(e) => changeStatus(complaint._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
