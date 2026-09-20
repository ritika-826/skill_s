import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyResults } from "../services/resultService";
import StatCard from "../components/StatCard";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyResults();
        console.log("RESULT HISTORY:", data);
        setResults(data.results || []);
      } catch (err) {
        console.error("RESULT HISTORY ERROR:", err);
        setError(err.response?.data?.message || "Unable to load assessment history");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  // Compute stats
  const totalTaken = results.length;
  const totalScore = results.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  const avgScore = totalTaken > 0 ? Math.round(totalScore / totalTaken) : 0;
  const bestScore = totalTaken > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Banner / Greeting Header */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeText}>
            <span style={styles.greetingTag}>👋 CANDIDATE WORKSPACE</span>
            <h1 style={styles.welcomeTitle}>
              Welcome back, <span style={styles.titleGradient}>{user?.name || "Candidate"}</span>
            </h1>
            <p style={styles.welcomeSub}>
              Select your job role and benchmark your skill proficiency with AI-generated assessments.
            </p>
          </div>
          <button
            onClick={() => navigate("/quiz-setup")}
            style={styles.primaryCtaBtn}
          >
            Start New Assessment →
          </button>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatCard
            title="Assessments Taken"
            value={totalTaken}
            subtext="Completed tests"
            icon="📝"
            accentColor="#38bdf8"
          />
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            subtext="Overall accuracy"
            icon="📈"
            accentColor={avgScore >= 70 ? "#22c55e" : "#eab308"}
          />
          <StatCard
            title="Best Performance"
            value={`${bestScore}%`}
            subtext="Highest score achieved"
            icon="🏆"
            accentColor="#818cf8"
          />
          <StatCard
            title="Target Role"
            value={user?.role || "DevOps"}
            subtext="Primary evaluation track"
            icon="🎯"
            accentColor="#38bdf8"
          />
        </div>

        {/* Main Content: Recent Results & Recommended Assessments */}
        <div style={styles.mainGrid}>
          {/* Recent Results Column */}
          <div style={styles.sectionCol}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Recent Assessments</h3>
              {results.length > 3 && (
                <button
                  onClick={() => navigate("/result-history")}
                  style={styles.viewAllBtn}
                >
                  View All History →
                </button>
              )}
            </div>

            {loading && <p style={styles.mutedText}>Loading recent assessments...</p>}
            {error && <p style={styles.errorText}>{error}</p>}

            {!loading && !error && results.length === 0 && (
              <div style={styles.emptyBox}>
                <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
                  You haven't completed any technical assessments yet.
                </p>
                <button
                  onClick={() => navigate("/quiz-setup")}
                  style={styles.startBtn}
                >
                  Take Your First Assessment
                </button>
              </div>
            )}

            {!loading &&
              results.length > 0 &&
              results.slice(0, 3).map((res) => (
                <div key={res._id} style={styles.resultItemCard}>
                  <div style={styles.resCardHeader}>
                    <div>
                      <h4 style={styles.resRoleTitle}>
                        {res.role || res.quiz?.role || res.quiz?.topic || "Technical Assessment"}
                      </h4>
                      <span style={styles.resDate}>
                        {new Date(res.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div style={styles.scorePill}>
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "800",
                          color: res.percentage >= 70 ? "#4ade80" : "#fca5a5",
                        }}
                      >
                        {res.percentage}%
                      </span>
                    </div>
                  </div>

                  <div style={styles.resStatsRow}>
                    <span style={styles.resStatTag}>
                      Score: {res.score} / {res.totalQuestions}
                    </span>
                    <span style={styles.resStatTag}>
                      Time: {Math.floor((res.timeTaken || 0) / 60)}m {(res.timeTaken || 0) % 60}s
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/result/${res._id}`)}
                    style={styles.viewResultBtn}
                  >
                    View Report & Explanation →
                  </button>
                </div>
              ))}
          </div>

          {/* Recommended Assessments Sidebar */}
          <div style={styles.sectionCol}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Recommended Tracks</h3>
            </div>

            <div style={styles.recGrid}>
              <div style={styles.recCard}>
                <div style={styles.recHeader}>
                  <span style={styles.recIcon}>⚙️</span>
                  <div>
                    <h4 style={styles.recTitle}>DevOps Engineer</h4>
                    <span style={styles.recSub}>Docker • Kubernetes • AWS</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/quiz-setup")}
                  style={styles.recBtn}
                >
                  Start Track
                </button>
              </div>

              <div style={styles.recCard}>
                <div style={styles.recHeader}>
                  <span style={styles.recIcon}>💻</span>
                  <div>
                    <h4 style={styles.recTitle}>Backend Developer</h4>
                    <span style={styles.recSub}>Node.js • APIs • Databases</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/quiz-setup")}
                  style={styles.recBtn}
                >
                  Start Track
                </button>
              </div>

              <div style={styles.recCard}>
                <div style={styles.recHeader}>
                  <span style={styles.recIcon}>📊</span>
                  <div>
                    <h4 style={styles.recTitle}>Data Analyst</h4>
                    <span style={styles.recSub}>SQL • Python • Statistics</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/quiz-setup")}
                  style={styles.recBtn}
                >
                  Start Track
                </button>
              </div>
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
    color: "#f8fafc",
    padding: "2.5rem 1.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  welcomeCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "2.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  welcomeText: {
    maxWidth: "680px",
  },
  greetingTag: {
    fontSize: "0.75rem",
    color: "#38bdf8",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  welcomeTitle: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "4px 0 8px 0",
  },
  titleGradient: {
    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  welcomeSub: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  primaryCtaBtn: {
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.9rem 1.75rem",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.35)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1.75rem",
  },
  sectionCol: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#f8fafc",
  },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyBox: {
    backgroundColor: "#0f172a",
    border: "1px dashed #334155",
    borderRadius: "14px",
    padding: "2.5rem",
    textAlign: "center",
  },
  startBtn: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },
  resultItemCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  resCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resRoleTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 2px 0",
  },
  resDate: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  scorePill: {
    backgroundColor: "#1e293b",
    padding: "0.3rem 0.75rem",
    borderRadius: "8px",
  },
  resStatsRow: {
    display: "flex",
    gap: "0.75rem",
  },
  resStatTag: {
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    fontSize: "0.8rem",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
  },
  viewResultBtn: {
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#38bdf8",
    padding: "0.6rem",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
    textAlign: "center",
    transition: "background 0.2s",
  },
  recGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  recCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  recHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  recIcon: {
    fontSize: "1.4rem",
  },
  recTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  recSub: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  recBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.45rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  mutedText: { color: "#94a3b8" },
  errorText: { color: "#ef4444" },
};

export default Dashboard;