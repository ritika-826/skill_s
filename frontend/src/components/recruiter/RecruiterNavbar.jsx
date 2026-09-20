import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function RecruiterNavbar() {
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

  const isActive = (path) => {
    if (path === "/recruiter/dashboard" && location.pathname === "/recruiter/dashboard") return true;
    if (path !== "/recruiter/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand Logo with Recruiter Badge */}
        <div style={styles.brandWrapper}>
          <Link to="/recruiter/dashboard" style={styles.brand}>
            <div style={styles.logoIcon}>⚡</div>
            <span style={styles.logoText}>
              Skill <span style={styles.logoAccent}>Specific</span>
            </span>
          </Link>
          <span style={styles.recruiterBadge}>RECRUITER</span>
        </div>

        {/* Desktop Navigation Links */}
        <div style={styles.desktopLinks}>
          <Link
            to="/recruiter/dashboard"
            style={{
              ...styles.link,
              ...(isActive("/recruiter/dashboard") ? styles.linkActive : {}),
            }}
          >
            Dashboard
          </Link>

          <Link
            to="/recruiter/students"
            style={{
              ...styles.link,
              ...(isActive("/recruiter/students") ? styles.linkActive : {}),
            }}
          >
            Students
          </Link>

          <Link
            to="/recruiter/assessments"
            style={{
              ...styles.link,
              ...(isActive("/recruiter/assessments") ? styles.linkActive : {}),
            }}
          >
            Assessments
          </Link>

          <Link
            to="/recruiter/analytics"
            style={{
              ...styles.link,
              ...(isActive("/recruiter/analytics") ? styles.linkActive : {}),
            }}
          >
            Analytics
          </Link>
        </div>

        {/* Right Side: Recruiter Info, Profile & Logout */}
        <div style={styles.authRight}>
          <div style={styles.userMenuWrapper}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={styles.userBtn}
            >
              <div style={styles.avatar}>
                {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
              </div>
              <div style={styles.userMeta}>
                <span style={styles.userName}>{user?.name || "Recruiter"}</span>
                <span style={styles.userRoleTag}>Talent Acquisition</span>
              </div>
              <span style={styles.caret}>▾</span>
            </button>

            {dropdownOpen && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <strong>{user?.name || "Recruiter"}</strong>
                  <p style={styles.dropdownEmail}>{user?.email || "recruiter@skillspecific.com"}</p>
                  <span style={styles.rolePill}>Recruiter Workspace</span>
                </div>
                <hr style={styles.divider} />
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  style={styles.dropdownItem}
                >
                  👤 Profile & Settings
                </Link>
                <Link
                  to="/recruiter/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  style={styles.dropdownItem}
                >
                  📊 Hiring Overview
                </Link>
                <hr style={styles.divider} />
                <button onClick={handleLogout} style={styles.logoutItem}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={styles.hamburger}
            aria-label="Toggle navigation"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div style={styles.mobileDrawer}>
          <Link
            to="/recruiter/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              ...styles.mobileLink,
              ...(isActive("/recruiter/dashboard") ? styles.mobileLinkActive : {}),
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/recruiter/students"
            onClick={() => setMenuOpen(false)}
            style={{
              ...styles.mobileLink,
              ...(isActive("/recruiter/students") ? styles.mobileLinkActive : {}),
            }}
          >
            👥 Students
          </Link>
          <Link
            to="/recruiter/assessments"
            onClick={() => setMenuOpen(false)}
            style={{
              ...styles.mobileLink,
              ...(isActive("/recruiter/assessments") ? styles.mobileLinkActive : {}),
            }}
          >
            📝 Assessments
          </Link>
          <Link
            to="/recruiter/analytics"
            onClick={() => setMenuOpen(false)}
            style={{
              ...styles.mobileLink,
              ...(isActive("/recruiter/analytics") ? styles.mobileLinkActive : {}),
            }}
          >
            📈 Analytics
          </Link>
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            style={styles.mobileLink}
          >
            👤 Profile
          </Link>
          <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
            🚪 Logout
          </button>
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
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
  },
  logoIcon: {
    fontSize: "1.35rem",
    color: "#38bdf8",
  },
  logoText: {
    fontSize: "1.35rem",
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: "-0.5px",
  },
  logoAccent: {
    color: "#38bdf8",
  },
  recruiterBadge: {
    backgroundColor: "rgba(129, 140, 248, 0.18)",
    color: "#818cf8",
    border: "1px solid rgba(129, 140, 248, 0.4)",
    padding: "0.15rem 0.55rem",
    borderRadius: "12px",
    fontSize: "0.7rem",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  desktopLinks: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  link: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    fontWeight: "500",
    textDecoration: "none",
    padding: "0.5rem 0",
    transition: "color 0.15s ease",
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
  userMenuWrapper: {
    position: "relative",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "24px",
    padding: "0.35rem 0.9rem 0.35rem 0.4rem",
    color: "#f8fafc",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "0.85rem",
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },
  userName: {
    fontWeight: "600",
    fontSize: "0.88rem",
    color: "#f8fafc",
    lineHeight: "1.2",
  },
  userRoleTag: {
    fontSize: "0.68rem",
    color: "#94a3b8",
  },
  caret: {
    color: "#94a3b8",
    fontSize: "0.75rem",
    marginLeft: "4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    width: "240px",
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    boxShadow: "0 12px 28px -5px rgba(0, 0, 0, 0.6)",
    padding: "0.75rem",
    zIndex: 1100,
  },
  dropdownHeader: {
    padding: "0.5rem",
  },
  dropdownEmail: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    margin: "3px 0 6px 0",
  },
  rolePill: {
    display: "inline-block",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    padding: "0.15rem 0.5rem",
    borderRadius: "10px",
    fontSize: "0.7rem",
    fontWeight: "700",
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
    padding: "1.25rem 1.5rem",
  },
  mobileLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "1rem",
    padding: "0.4rem 0",
  },
  mobileLinkActive: {
    color: "#38bdf8",
    fontWeight: "700",
  },
  mobileLogoutBtn: {
    marginTop: "0.5rem",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    border: "1px solid #ef4444",
    padding: "0.65rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default RecruiterNavbar;
