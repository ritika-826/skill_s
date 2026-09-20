import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({ email, password });
      console.log("Login successful:", data);

      login(data.user, data.token);

      const role = data.user?.role ? data.user.role.toLowerCase() : "student";
      if (role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message || err.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");

    try {
      setLoading(true);
      const data = await loginUser({ email: demoEmail, password: demoPass });
      login(data.user, data.token);

      const role = data.user?.role ? data.user.role.toLowerCase() : "student";
      if (role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("DEMO LOGIN ERROR:", err);
      setError(err.response?.data?.message || err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Side: Brand / Hero Graphics */}
        <div style={styles.leftCol}>
          <div style={styles.brandBadge}>⚡ Skill Specific Assessment Engine</div>
          <h1 style={styles.leftTitle}>
            Assess Your Technical Skills with <span style={styles.gradientText}>AI Accuracy</span>
          </h1>
          <p style={styles.leftDesc}>
            Log in to continue your assessment journey, access detailed performance reports, and prepare for technical interviews.
          </p>

          <div style={styles.featureBox}>
            <div style={styles.featureItem}>
              <span style={styles.featureCheck}>✓</span>
              <span>20-minute role-focused technical evaluations</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureCheck}>✓</span>
              <span>AI & RAG verified question banks</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureCheck}>✓</span>
              <span>Topic-level accuracy & weakness analytics</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Welcome Back</h2>
            <p style={styles.cardSubtitle}>Sign in to your Skill Specific account</p>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Password</label>
                  <a href="#forgot" style={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            {/* Quick Demo Role Logins */}
            <div style={{ marginTop: "1.25rem", borderTop: "1px solid #1e293b", paddingTop: "1rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>
                ⚡ Quick Demo Login:
              </span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("candidate@demo.com", "candidate123")}
                  style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#38bdf8", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  🎓 Candidate Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin("recruiter@demo.com", "recruiter123")}
                  style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#818cf8", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  💼 Recruiter Demo
                </button>
              </div>
            </div>

            <div style={styles.footerRow}>
              <span>Don't have an account?</span>{" "}
              <Link to="/register" style={styles.signupLink}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 68px)",
    backgroundColor: "#0b0f19",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1100px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  brandBadge: {
    display: "inline-block",
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "0.3rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "700",
    width: "fit-content",
  },
  leftTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#f8fafc",
    lineHeight: "1.2",
  },
  gradientText: {
    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  leftDesc: {
    fontSize: "1rem",
    color: "#cbd5e1",
    lineHeight: "1.6",
  },
  featureBox: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  featureCheck: {
    color: "#22c55e",
    fontWeight: "800",
  },
  rightCol: {
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  cardTitle: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: "0.25rem",
  },
  cardSubtitle: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginBottom: "1.75rem",
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "0.75rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  forgotLink: {
    fontSize: "0.8rem",
    color: "#38bdf8",
    textDecoration: "none",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.95rem",
    outline: "none",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeBtn: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  submitBtn: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.9rem",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
  },
  footerRow: {
    marginTop: "1.75rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  signupLink: {
    color: "#38bdf8",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Login;