import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyComplaints } from "../../../services/complaintService";
import ComplaintCard from "../../../components/ComplaintCard/ComplaintCard";

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMyComplaints();
        setComplaints(response.data.complaints || []);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Citizen Dashboard</h1>
        <p>Track your civic complaints and their status</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Complaints</div>
          <div className="stat-value">{complaints.length}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgress}</div>
        </div>
        <div className="stat-card resolved">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{resolved}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--primary)" }}>Recent Complaints</h2>
        <Link to="/create-complaint" className="btn btn-primary">Report Issue</Link>
      </div>

      {complaints.length === 0 ? (
        <div className="empty-state">
          <h3>No complaints yet</h3>
          <p>Report your first civic issue to get started.</p>
          <Link to="/create-complaint" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Report an Issue
          </Link>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.slice(0, 6).map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}

      {complaints.length > 6 && (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link to="/complaints" className="btn btn-secondary">View All Complaints</Link>
        </div>
      )}
    </div>
  );
}
