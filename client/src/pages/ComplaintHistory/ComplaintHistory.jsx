import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyComplaints } from "../../services/complaintService";
import ComplaintCard from "../../components/ComplaintCard/ComplaintCard";

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMyComplaints();
        setComplaints(response.data.complaints || []);
      } catch {
        setError("Failed to load complaint history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Complaint History</h1>
        <p>View all complaints you have submitted</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      {complaints.length === 0 ? (
        <div className="empty-state">
          <h3>No complaints yet</h3>
          <p>You haven&apos;t submitted any complaints. Report an issue to get started.</p>
          <Link to="/create-complaint" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Report an Issue
          </Link>
        </div>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      )}
    </div>
  );
}
