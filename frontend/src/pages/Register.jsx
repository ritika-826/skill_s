import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Evaluate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "", score: 0, color: "#334155" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: "Weak", score: 33, color: "#ef4444" };
    if (score === 2) return { label: "Fair", score: 66, color: "#eab308" };
    return { label: "Strong", score: 100, color: "#22c55e" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser({ name, email, password, role });
      console.log("Registration successful:", data);

      if (data.user && data.token) {
        login(data.user, data.token);
        const userRole = data.user.role ? data.user.role.toLowerCase() : "student";
        if (userRole === "recruiter") {
          navigate("/recruiter/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(
        err.response?.data?.message || err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Side: Brand Value Graphic */}
        <div style={styles.leftCol}>
          <div style={styles.brandBadge}>🚀 Join Skill Specific</div>
          <h1 style={styles.leftTitle}>
            Start Your Journey with <span style={styles.gradientText}>AI Skill Evaluation</span>
          </h1>
          <p style={styles.leftDesc}>
            Create your account to unlock role-based technical assessments, track your progress over time, and master key engineering skills.
          </p>

          <div style={styles.statsBox}>
            <div style={styles.statMini}>
              <span style={styles.statNum}>11+</span>
              <span style={styles.statLabel}>Target Roles</span>
            </div>
            <div style={styles.statMini}>
              <span style={styles.statNum}>20 Min</span>
              <span style={styles.statLabel}>Assessment Timer</span>
            </div>
            <div style={styles.statMini}>
              <span style={styles.statNum}>100%</span>
              <span style={styles.statLabel}>Skill Targeted</span>
            </div>
          </div>
        </div>

        {/* Right Side: Register Card */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Create Account</h2>
            <p style={styles.cardSubtitle}>Get started with your free candidate profile</p>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Account Role</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    style={{
                      padding: "0.65rem",
                      borderRadius: "8px",
                      border: role === "student" ? "1px solid #38bdf8" : "1px solid #334155",
                      backgroundColor: role === "student" ? "rgba(56, 189, 248, 0.15)" : "#090d16",
                      color: role === "student" ? "#38bdf8" : "#94a3b8",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    🎓 Candidate / Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    style={{
                      padding: "0.65rem",
                      borderRadius: "8px",
                      border: role === "recruiter" ? "1px solid #818cf8" : "1px solid #334155",
                      backgroundColor: role === "recruiter" ? "rgba(129, 140, 248, 0.15)" : "#090d16",
                      color: role === "recruiter" ? "#818cf8" : "#94a3b8",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    💼 Recruiter / Hiring
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address *</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password *</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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
                {/* Password Strength Meter */}
                {password && (
                  <div style={styles.strengthMeter}>
                    <div style={styles.strengthHeader}>
                      <span>Strength:</span>
                      <strong style={{ color: strength.color }}>{strength.label}</strong>
                    </div>
                    <div style={styles.strengthTrack}>
                      <div
                        style={{
                          ...styles.strengthFill,
                          width: `${strength.score}%`,
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            <div style={styles.footerRow}>
              <span>Already have an account?</span>{" "}
              <Link to="/login" style={styles.loginLink}>
                Sign In
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
  statsBox: {
    marginTop: "1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    padding: "1.25rem",
    borderRadius: "12px",
  },
  statMini: {
    display: "flex",
    flexDirection: "column",
  },
  statNum: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#38bdf8",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
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
    padding: "2.25rem",
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
    marginBottom: "1.5rem",
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
    gap: "1.1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
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
  strengthMeter: {
    marginTop: "0.3rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },
  strengthHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  strengthTrack: {
    height: "4px",
    backgroundColor: "#1e293b",
    borderRadius: "2px",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    transition: "width 0.3s ease, background-color 0.3s ease",
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
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  loginLink: {
    color: "#38bdf8",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Register;