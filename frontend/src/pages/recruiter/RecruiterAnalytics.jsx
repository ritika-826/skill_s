import { useEffect, useState } from "react";
import { getRecruiterAnalytics } from "../../services/recruiterService";
import RecruiterStatCard from "../../components/recruiter/RecruiterStatCard";
import {
  ScoreDistributionChart,
  StudentsByRoleChart,
  SkillPerformanceChart,
} from "../../components/recruiter/Charts";
import RecruiterLoadingSkeleton from "../../components/recruiter/RecruiterLoadingSkeleton";

function RecruiterAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [dateRange, setDateRange] = useState("30d");
  const [targetRole, setTargetRole] = useState("All");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        dateRange,
        targetRole: targetRole !== "All" ? targetRole : undefined,
      };

      const res = await getRecruiterAnalytics(params);
      setData(res);
    } catch (err) {
      console.error("LOAD ANALYTICS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load recruitment analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, targetRole]);

  const metrics = data?.metrics || {};
  const scoreDistribution = data?.scoreDistribution || [];
  const rolePerformance = data?.rolePerformance || [];
  const topicPerformance = data?.topicPerformance || [];
  const difficultyPerformance = data?.difficultyPerformance || [];
  const mostAttemptedRoles = data?.mostAttemptedRoles || [];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>RECRUITMENT BENCHMARKING</div>
            <h1 style={styles.title}>Hiring & Assessment Analytics</h1>
            <p style={styles.subtitle}>
              Deep dive into score distributions, skill proficiencies, and candidate trends.
            </p>
          </div>

          {/* Filter Controls */}
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Time Window</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={styles.select}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Role Filter</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Tracks</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <RecruiterLoadingSkeleton count={4} />}

        {/* Error State */}
        {error && (
          <div style={styles.errorAlert}>
            <p>⚠️ {error}</p>
            <button onClick={fetchAnalytics} style={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Top 4 Macro Metrics */}
            <div style={styles.statsGrid}>
              <RecruiterStatCard
                title="Total Assessments"
                value={metrics.totalAssessments?.toLocaleString() || "0"}
                subtext="Evaluations matching filters"
                icon="📝"
                accentColor="#38bdf8"
              />
              <RecruiterStatCard
                title="Average Score"
                value={`${metrics.averageScore || 0}%`}
                subtext="Overall candidate proficiency"
                icon="📈"
                accentColor={metrics.averageScore >= 75 ? "#22c55e" : "#eab308"}
              />
              <RecruiterStatCard
                title="Completion Rate"
                value={`${metrics.completionRate || 0}%`}
                subtext="Started vs submitted assessments"
                icon="🎯"
                accentColor="#14b8a6"
              />
              <RecruiterStatCard
                title="Avg Completion Time"
                value={metrics.averageCompletionTime || "0m 0s"}
                subtext="Standard evaluation duration"
                icon="⏱️"
                accentColor="#818cf8"
              />
            </div>

            {/* Middle Grid: Score Distribution & Role Performance */}
            <div style={styles.twoColGrid}>
              {/* Score Distribution Histogram */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Score Distribution</h3>
                    <p style={styles.cardSub}>Number of candidates across percentage ranges</p>
                  </div>
                </div>
                <ScoreDistributionChart data={scoreDistribution} />
              </div>

              {/* Difficulty-wise Performance */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Difficulty Performance</h3>
                    <p style={styles.cardSub}>Candidate accuracy across question difficulty tiers</p>
                  </div>
                </div>

                <div style={styles.diffMatrix}>
                  {difficultyPerformance.map((d) => {
                    const color =
                      d.difficulty === "Easy"
                        ? "#22c55e"
                        : d.difficulty === "Medium"
                        ? "#38bdf8"
                        : "#f43f5e";

                    return (
                      <div key={d.difficulty} style={styles.diffTierCard}>
                        <div style={styles.diffTierTop}>
                          <span style={styles.diffTierName}>{d.difficulty} Questions</span>
                          <span style={{ color, fontWeight: "800", fontSize: "1.1rem" }}>
                            {d.percentage}%
                          </span>
                        </div>
                        <div style={styles.track}>
                          <div
                            style={{
                              ...styles.fill,
                              width: `${d.percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span style={styles.diffTierSub}>
                          {d.correct} correct out of {d.total} answered
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Grid: Skill Performance & Role Breakdown */}
            <div style={styles.twoColGrid}>
              {/* Skill Proficiency Across Topics */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Skill & Topic Benchmark</h3>
                    <p style={styles.cardSub}>Average test score across technical skills</p>
                  </div>
                </div>
                <SkillPerformanceChart data={topicPerformance.slice(0, 8)} />
              </div>

              {/* Performance by Target Role Table */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Performance by Target Role</h3>
                    <p style={styles.cardSub}>Comparison of candidates across hiring roles</p>
                  </div>
                </div>

                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Role Track</th>
                        <th style={styles.th}>Assessments</th>
                        <th style={styles.th}>Average Score</th>
                        <th style={styles.thRight}>Peak Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolePerformance.map((item) => (
                        <tr key={item.role} style={styles.tr}>
                          <td style={styles.td}>
                            <strong style={{ color: "#f8fafc" }}>{item.role}</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#cbd5e1" }}>{item.assessments} tests</span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                fontWeight: "700",
                                color: item.avgScore >= 80 ? "#4ade80" : "#38bdf8",
                              }}
                            >
                              {item.avgScore}%
                            </span>
                          </td>
                          <td style={styles.tdRight}>
                            <span style={{ fontWeight: "700", color: "#f8fafc" }}>
                              {item.highestScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 68px)",
    backgroundColor: "#090d16",
    color: "#f8fafc",
    padding: "2rem 1.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "1.5rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #1e293b",
  },
  badge: {
    fontSize: "0.72rem",
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: "0.75px",
    marginBottom: "4px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    margin: "2px 0 6px 0",
    color: "#f8fafc",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#94a3b8",
  },
  filterRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  filterLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  select: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.6rem 0.9rem",
    color: "#f8fafc",
    fontSize: "0.88rem",
    outline: "none",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "1.25rem",
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    margin: "0 0 3px 0",
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  cardSub: {
    margin: 0,
    fontSize: "0.82rem",
    color: "#94a3b8",
  },
  diffMatrix: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    justifyContent: "center",
    flex: 1,
  },
  diffTierCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  diffTierTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  diffTierName: {
    fontWeight: "700",
    color: "#f8fafc",
    fontSize: "0.95rem",
  },
  diffTierSub: {
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  track: {
    height: "7px",
    backgroundColor: "#090d16",
    borderRadius: "4px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "4px",
  },
  tableResponsive: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "0.75rem 0.85rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    borderBottom: "1px solid #1e293b",
  },
  thRight: {
    padding: "0.75rem 0.85rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    borderBottom: "1px solid #1e293b",
    textAlign: "right",
  },
  tr: {
    borderBottom: "1px solid #1e293b",
  },
  td: {
    padding: "0.9rem 0.85rem",
    fontSize: "0.88rem",
  },
  tdRight: {
    padding: "0.9rem 0.85rem",
    fontSize: "0.88rem",
    textAlign: "right",
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "1.25rem",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  retryBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.4rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default RecruiterAnalytics;
