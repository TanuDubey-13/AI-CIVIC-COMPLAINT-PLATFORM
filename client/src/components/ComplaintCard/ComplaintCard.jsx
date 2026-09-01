import { Link } from "react-router-dom";
import { formatCategory, formatDate } from "../../utils/formatters";

export default function ComplaintCard({ complaint }) {
  return (
    <div className="complaint-card">
      <img src={complaint.image} alt={complaint.title} />
      <div className="complaint-card-body">
        <h3>{complaint.title}</h3>
        <div className="complaint-meta">
          <span className="badge badge-in_progress">{formatCategory(complaint.category)}</span>
          <span className={`badge badge-${complaint.severity}`}>{complaint.severity}</span>
          <span className={`badge badge-${complaint.status}`}>{complaint.status?.replace("_", " ")}</span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          {formatDate(complaint.createdAt)}
        </p>
        <Link to={`/complaint/${complaint._id}`}>
          <button className="btn btn-secondary" style={{ width: "100%" }}>
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}
