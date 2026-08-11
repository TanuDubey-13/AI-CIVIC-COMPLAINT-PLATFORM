import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const citizenLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/create-complaint", label: "Report Issue" },
    { to: "/complaints", label: "Complaint History" },
    { to: "/notifications", label: "Notifications" },
    { to: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { to: "/", label: "Home" },
    { to: "/admin", label: "Admin Dashboard" },
    { to: "/profile", label: "Profile" },
  ];

  const guestLinks = [
    { to: "/", label: "Home" },
    { to: "/login", label: "Login" },
    { to: "/register", label: "Register" },
  ];

  const links = user ? (isAdmin ? adminLinks : citizenLinks) : guestLinks;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🏛</span>
          CivicAI
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={isActive(to) ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user && (
            <>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                {user.name}
              </span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
