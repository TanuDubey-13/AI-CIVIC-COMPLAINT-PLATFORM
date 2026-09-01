import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div>
      <section className="hero">
        <h1>AI Civic Complaint Platform</h1>
        <p>
          Report potholes, garbage, water leakage, and other public infrastructure issues.
          Our AI analyzes your photos and routes complaints to the right department.
        </p>
        <div className="hero-actions">
          {user ? (
            isAdmin ? (
              <Link to="/admin" className="btn btn-primary btn-lg">Admin Dashboard</Link>
            ) : (
              <>
                <Link to="/create-complaint" className="btn btn-primary btn-lg">Report Issue</Link>
                <Link to="/dashboard" className="btn btn-outline btn-lg">My Dashboard</Link>
              </>
            )
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
            </>
          )}
        </div>
      </section>

      <h2 className="section-title">How It Works</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📸</div>
          <h3>Upload Photo</h3>
          <p>Take a photo of the civic issue and upload it through our platform.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI Analysis</h3>
          <p>Our AI detects the category, severity, and confidence level automatically.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏢</div>
          <h3>Department Assignment</h3>
          <p>Complaints are routed to the appropriate government department.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Track Resolution</h3>
          <p>Monitor your complaint status from submission to resolution.</p>
        </div>
      </div>
    </div>
  );
}
