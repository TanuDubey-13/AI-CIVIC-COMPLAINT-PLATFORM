import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your account information</p>
      </div>

      <div className="form-section" style={{ maxWidth: 520 }}>
        <div className="info-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Name</span>
          <span style={{ fontWeight: 600 }}>{user.name}</span>
        </div>
        <div className="info-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Email</span>
          <span>{user.email}</span>
        </div>
        <div className="info-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Phone</span>
          <span>{user.phone || "—"}</span>
        </div>
        <div className="info-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ color: "var(--text-muted)" }}>Role</span>
          <span className="badge badge-in_progress">{user.role}</span>
        </div>
        <div className="info-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0" }}>
          <span style={{ color: "var(--text-muted)" }}>Account Status</span>
          <span className={`badge ${user.isActive ? "badge-resolved" : "badge-rejected"}`}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}
