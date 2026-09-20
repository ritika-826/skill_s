import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyResults } from "../services/resultService";
import ProgressBar from "../components/ProgressBar";

function Profile() {
  const { user } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Account Settings Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getMyResults();
        setResults(data.results || []);
      } catch (err) {
        console.error("PROFILE DATA LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalTaken = results.length;
  const totalScore = results.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
  const avgScore = totalTaken > 0 ? Math.round(totalScore / totalTaken) : 0;
  const bestScore = totalTaken > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;
  const completionRate = totalTaken > 0 ? 100 : 0;

  // Derive skill breakdown map from results
  const skillScores = {};
  results.forEach((r) => {
    if (r.topicPerformance && Array.isArray(r.topicPerformance)) {
      r.topicPerformance.forEach((tp) => {
        if (!skillScores[tp.topic]) {
          skillScores[tp.topic] = { totalPct: 0, count: 0 };
        }
        skillScores[tp.topic].totalPct += tp.percentage;
        skillScores[tp.topic].count += 1;
      });
    }
  });

  const skillBreakdown = Object.keys(skillScores).map((topic) => ({
    topic,
    percentage: Math.round(skillScores[topic].totalPct / skillScores[topic].count),
  }));

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedNotice("Profile settings saved successfully.");
    setTimeout(() => setSavedNotice(""), 3000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top Profile Header Card */}
        <div style={styles.profileBanner}>
          <div style={styles.avatarLarge}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div style={styles.bannerInfo}>
            <h1 style={styles.candidateName}>{user?.name || "Candidate Name"}</h1>
            <p style={styles.candidateEmail}>{user?.email || "candidate@example.com"}</p>
            <div style={styles.roleBadgeRow}>
              
             
            </div>
          </div>
        </div>

        {/* Profile Tabs Header */}
        <div style={styles.tabsRow}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "overview" ? styles.tabBtnActive : {}),
            }}
          >
            Overview & Skills
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "settings" ? styles.tabBtnActive : {}),
            }}
          >
            Account Settings
          </button>
        </div>

        {/* Tab 1: Overview & Skills */}
        {activeTab === "overview" && (
          <div style={styles.tabContent}>
            {/* Stats Summary Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Assessments Taken</span>
                <span style={styles.statVal}>{totalTaken}</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Average Score</span>
                <span style={{ ...styles.statVal, color: avgScore >= 70 ? "#22c55e" : "#38bdf8" }}>
                  {avgScore}%
                </span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Best Score</span>
                <span style={{ ...styles.statVal, color: "#818cf8" }}>{bestScore}%</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statLabel}>Completion Rate</span>
                <span style={styles.statVal}>{completionRate}%</span>
              </div>
            </div>

            {/* Main 2-Column: Skill Proficiency & Recent Activity */}
            <div style={styles.overviewGrid}>
              {/* Skill Proficiency Column */}
              <div style={styles.cardSection}>
                <h3 style={styles.sectionTitle}>Skill Proficiency Breakdown</h3>
                {skillBreakdown.length > 0 ? (
                  <div style={styles.skillsList}>
                    {skillBreakdown.map((sb, idx) => (
                      <ProgressBar
                        key={idx}
                        label={sb.topic}
                        value={sb.percentage}
                        max={100}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#94a3b8" }}>
                    Complete your first assessment to unlock skill proficiency metrics.
                  </p>
                )}
              </div>

              {/* Recent Activity Column */}
              <div style={styles.cardSection}>
                <h3 style={styles.sectionTitle}>Recent Activity</h3>
                {loading && <p style={{ color: "#94a3b8" }}>Loading activity...</p>}
                {!loading && results.length === 0 && (
                  <p style={{ color: "#94a3b8" }}>No recent assessment activity recorded.</p>
                )}
                {!loading &&
                  results.slice(0, 4).map((r, i) => (
                    <div key={i} style={styles.activityItem}>
                      <div style={styles.activityDot} />
                      <div>
                        <strong style={{ color: "#f8fafc", fontSize: "0.95rem" }}>
                          {r.role || r.quiz?.topic || "Assessment"} Completed
                        </strong>
                        <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "2px 0 0 0" }}>
                          Score: {r.score}/{r.totalQuestions} ({r.percentage}%) •{" "}
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Account Settings */}
        {activeTab === "settings" && (
          <div style={styles.cardSection}>
            <h3 style={styles.sectionTitle}>Account Settings</h3>
            {savedNotice && <div style={styles.successBanner}>{savedNotice}</div>}

            <form onSubmit={handleSaveSettings} style={styles.settingsForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  style={styles.formInput}
                />
              </div>

              <button type="submit" style={styles.saveBtn}>
                Save Changes
              </button>
            </form>
          </div>
        )}
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
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.75rem",
  },
  profileBanner: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1.75rem",
  },
  avatarLarge: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontSize: "2rem",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
  },
  bannerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  candidateName: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
  },
  candidateEmail: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    margin: 0,
  },
  roleBadgeRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
    alignItems: "center",
  },
  roleBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    color: "#38bdf8",
    border: "1px solid #38bdf8",
    padding: "0.25rem 0.65rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  statusPill: {
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    padding: "0.25rem 0.65rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
  },
  tabsRow: {
    display: "flex",
    gap: "1rem",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "0.5rem",
  },
  tabBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: "0.95rem",
    fontWeight: "600",
    padding: "0.5rem 0.75rem",
    cursor: "pointer",
  },
  tabBtnActive: {
    color: "#38bdf8",
    borderBottom: "2px solid #38bdf8",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.75rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },
  statBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  statLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statVal: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  cardSection: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.75rem",
  },
  sectionTitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: "1.25rem",
  },
  skillsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.85rem",
    padding: "0.85rem 0",
    borderBottom: "1px solid #1e293b",
  },
  activityDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#38bdf8",
    marginTop: "5px",
    flexShrink: 0,
  },
  settingsForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    maxWidth: "500px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  formLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#cbd5e1",
  },
  formInput: {
    padding: "0.75rem 1rem",
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.95rem",
    outline: "none",
  },
  saveBtn: {
    marginTop: "0.5rem",
    padding: "0.85rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    width: "fit-content",
  },
  successBanner: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid #22c55e",
    color: "#4ade80",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
};

export default Profile;