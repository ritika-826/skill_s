import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Left Column: Brand & Summary */}
        <div style={styles.brandCol}>
          <div style={styles.brand}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>
              Skill <span style={styles.logoAccent}>Specific</span>
            </span>
          </div>
          <p style={styles.summary}>
            AI-powered skill-specific assessment platform designed for modern engineering roles. Evaluate your proficiency with topic-targeted assessments.
          </p>
        </div>

        {/* Middle Column: Quick Links */}
        <div style={styles.linkCol}>
          <h4 style={styles.colTitle}>Navigation</h4>
          <ul style={styles.linkList}>
            <li><Link to="/" style={styles.link}>Home</Link></li>
            <li><Link to="/quiz-setup" style={styles.link}>Assessments</Link></li>
            <li><Link to="/result-history" style={styles.link}>History</Link></li>
            <li><Link to="/profile" style={styles.link}>Profile</Link></li>
          </ul>
        </div>

        {/* Right Column: Support & Info */}
        <div style={styles.linkCol}>
          <h4 style={styles.colTitle}>Support</h4>
          <ul style={styles.linkList}>
            <li><a href="#help" style={styles.link}>Documentation</a></li>
            <li><a href="#contact" style={styles.link}>Contact Support</a></li>
            <li><a href="#privacy" style={styles.link}>Privacy Policy</a></li>
            <li><a href="#terms" style={styles.link}>Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div style={styles.bottomBar}>
        <div style={styles.bottomContainer}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Skill Specific. All rights reserved. AI-powered skill-specific assessments.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#080c14",
    borderTop: "1px solid #1e293b",
    color: "#94a3b8",
    paddingTop: "3.5rem",
    marginTop: "auto",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem 3rem 1.5rem",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "3rem",
  },
  brandCol: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoIcon: {
    fontSize: "1.4rem",
    color: "#38bdf8",
  },
  logoText: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  logoAccent: {
    color: "#38bdf8",
  },
  summary: {
    fontSize: "0.9rem",
    lineHeight: "1.6",
    color: "#94a3b8",
    maxWidth: "420px",
  },
  linkCol: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  colTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  linkList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  link: {
    color: "#94a3b8",
    fontSize: "0.9rem",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  bottomBar: {
    borderTop: "1px solid #161e2e",
    backgroundColor: "#05080f",
    padding: "1.25rem 0",
  },
  bottomContainer: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 1.5rem",
    textAlign: "center",
  },
  copyright: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
};

export default Footer;
