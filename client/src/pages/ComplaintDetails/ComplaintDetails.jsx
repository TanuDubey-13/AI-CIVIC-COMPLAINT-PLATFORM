import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getComplaintById } from "../../services/complaintService";
import StatusTimeline from "../../components/StatusTimeline/StatusTimeline";
import { formatCategory, formatDate } from "../../utils/formatters";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await getComplaintById(id);
        setComplaint(response.data.complaint);
      } catch {
        setError("Failed to load complaint details.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading complaint...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="empty-state">
        <h3>{error || "Complaint not found"}</h3>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>{complaint.title}</h1>
        <p>Submitted on {formatDate(complaint.createdAt)}</p>
      </div>

      <div className="detail-grid">
        <div>
          <img src={complaint.image} alt={complaint.title} className="detail-image" />
        </div>

        <div className="form-section detail-info">
          <div className="info-row">
            <span className="label">Category</span>
            <span className={`badge badge-in_progress`}>{formatCategory(complaint.category)}</span>
          </div>
          <div className="info-row">
            <span className="label">Severity</span>
            <span className={`badge badge-${complaint.severity}`}>{complaint.severity}</span>
          </div>
          <div className="info-row">
            <span className="label">Status</span>
            <span className={`badge badge-${complaint.status}`}>{complaint.status?.replace("_", " ")}</span>
          </div>
          <div className="info-row">
            <span className="label">Location</span>
            <span>{complaint.location}</span>
          </div>
          <div className="info-row">
            <span className="label">Department</span>
            <span>{complaint.department?.name || "Not Assigned"}</span>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Description</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{complaint.description}</p>
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--primary)", marginBottom: "1rem" }}>
          Status Timeline
        </h2>
        <StatusTimeline status={complaint.status} />
      </div>
    </div>
  );
}
