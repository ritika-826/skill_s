import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand Logo */}
        <Link
          to={
            user
              ? user.role?.toLowerCase() === "recruiter"
                ? "/recruiter/dashboard"
                : "/dashboard"
              : "/"
          }
          style={styles.brand}
        >
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>
            Skill <span style={styles.logoAccent}>Specific</span>
          </span>
          <span style={styles.aiTag}>AI</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={styles.desktopLinks}>
          <Link
            to="/"
            style={{
              ...styles.link,
              ...(isActive("/") ? styles.linkActive : {}),
            }}
          >
            Home
          </Link>

          <Link
            to="/quiz-setup"
            style={{
              ...styles.link,
              ...(isActive("/quiz-setup") || isActive("/quiz/setup") ? styles.linkActive : {}),
            }}
          >
            Assessments
          </Link>

          {user && (
            <Link
              to="/result-history"
              style={{
                ...styles.link,
                ...(isActive("/result-history") || isActive("/history") ? styles.linkActive : {}),
              }}
            >
              History
            </Link>
          )}

          {user && (
            <Link
              to="/profile"
              style={{
                ...styles.link,
                ...(isActive("/profile") ? styles.linkActive : {}),
              }}
            >
              Profile
            </Link>
          )}
        </div>

        {/* User Profile / Auth Action */}
        <div style={styles.authRight}>
          {user ? (
            <div style={styles.userMenuWrapper}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={styles.userBtn}
              >
                <div style={styles.avatar}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span style={styles.userName}>{user.name || "Candidate"}</span>
                <span style={styles.caret}>▾</span>
              </button>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <strong>{user.name}</strong>
                    <p style={styles.dropdownEmail}>{user.email}</p>
                  </div>
                  <hr style={styles.divider} />
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={styles.dropdownItem}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/result-history"
                    onClick={() => setDropdownOpen(false)}
                    style={styles.dropdownItem}
                  >
                    📊 Assessment History
                  </Link>
                  <hr style={styles.divider} />
                  <button onClick={handleLogout} style={styles.logoutItem}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.guestBtns}>
              <Link to="/login" style={styles.loginBtn}>
                Login
              </Link>
              <Link to="/register" style={styles.signupBtn}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.hamburger}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={styles.mobileDrawer}>
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={styles.mobileLink}
          >
            Home
          </Link>
          <Link
            to="/quiz-setup"
            onClick={() => setMenuOpen(false)}
            style={styles.mobileLink}
          >
            Assessments
          </Link>
          {user && (
            <Link
              to="/result-history"
              onClick={() => setMenuOpen(false)}
              style={styles.mobileLink}
            >
              History
            </Link>
          )}
          {user && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              style={styles.mobileLink}
            >
              Profile
            </Link>
          )}
          {user ? (
            <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
              Logout
            </button>
          ) : (
            <div style={styles.mobileAuthRow}>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                style={styles.mobileLoginLink}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                style={styles.mobileSignupLink}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: "#0f172a",
    borderBottom: "1px solid #1e293b",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
  },
  logoIcon: {
    fontSize: "1.3rem",
    color: "#38bdf8",
  },
  logoText: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: "-0.5px",
  },
  logoAccent: {
    color: "#38bdf8",
  },
  aiTag: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "700",
    marginLeft: "4px",
  },
  desktopLinks: {
    display: "flex",
    gap: "1.75rem",
    alignItems: "center",
  },
  link: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
    fontWeight: "500",
    textDecoration: "none",
    padding: "0.4rem 0",
    transition: "color 0.2s",
  },
  linkActive: {
    color: "#38bdf8",
    fontWeight: "700",
    borderBottom: "2px solid #38bdf8",
  },
  authRight: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  guestBtns: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  loginBtn: {
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: "0.9rem",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
  },
  signupBtn: {
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "0.9rem",
    padding: "0.5rem 1.1rem",
    borderRadius: "8px",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
  },
  userMenuWrapper: {
    position: "relative",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "20px",
    padding: "0.35rem 0.85rem 0.35rem 0.4rem",
    color: "#f8fafc",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.85rem",
  },
  userName: {
    fontWeight: "600",
  },
  caret: {
    color: "#94a3b8",
    fontSize: "0.75rem",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "220px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    padding: "0.75rem",
    zIndex: 1100,
  },
  dropdownHeader: {
    padding: "0.5rem",
  },
  dropdownEmail: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    margin: "2px 0 0 0",
  },
  divider: {
    borderColor: "#1e293b",
    margin: "0.5rem 0",
  },
  dropdownItem: {
    display: "block",
    padding: "0.6rem 0.75rem",
    color: "#cbd5e1",
    fontSize: "0.9rem",
    borderRadius: "6px",
    textDecoration: "none",
    transition: "background 0.15s",
  },
  logoutItem: {
    width: "100%",
    textAlign: "left",
    padding: "0.6rem 0.75rem",
    color: "#fca5a5",
    background: "none",
    border: "none",
    fontSize: "0.9rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  hamburger: {
    display: "none",
    background: "none",
    border: "none",
    color: "#f8fafc",
    fontSize: "1.4rem",
    cursor: "pointer",
  },
  mobileDrawer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    backgroundColor: "#0f172a",
    borderBottom: "1px solid #1e293b",
    padding: "1rem 1.5rem",
  },
  mobileLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "1rem",
    padding: "0.4rem 0",
  },
  mobileLogoutBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    border: "1px solid #ef4444",
    padding: "0.6rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mobileAuthRow: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.5rem",
  },
  mobileLoginLink: {
    flex: 1,
    textAlign: "center",
    padding: "0.6rem",
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
  },
  mobileSignupLink: {
    flex: 1,
    textAlign: "center",
    padding: "0.6rem",
    backgroundColor: "#0284c7",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
  },
};

export default Navbar;
