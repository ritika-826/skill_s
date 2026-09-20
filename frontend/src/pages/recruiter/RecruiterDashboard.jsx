import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecruiterDashboard } from "../../services/recruiterService";
import RecruiterStatCard from "../../components/recruiter/RecruiterStatCard";
import {
  PerformanceOverviewChart,
  StudentsByRoleChart,
  SkillPerformanceChart,
  CompletionTrendChart,
} from "../../components/recruiter/Charts";
import AssessmentDetailModal from "../../components/recruiter/AssessmentDetailModal";
import RecruiterLoadingSkeleton from "../../components/recruiter/RecruiterLoadingSkeleton";
import RecruiterEmptyState from "../../components/recruiter/RecruiterEmptyState";

const STANDARD_ROLES = [
  "All Roles",
  "DevOps Engineer",
  "Cloud Engineer",
  "Site Reliability Engineer (SRE)",
  "Infrastructure Engineer",
  "Security Engineer / DevSecOps",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Data Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "QA Automation Engineer",
  "Software Engineer in Test (SDET)",
  "Mobile App Developer (React Native/Flutter)",
  "iOS Developer",
  "Android Developer",
  "Database Administrator (DBA)",
  "System Administrator",
  "Network Engineer",
  "Cybersecurity Analyst",
  "Solutions Architect",
];

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  // Filters
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        role: selectedRole !== "All Roles" ? selectedRole : undefined,
        dateRange: selectedDateRange !== "all" ? selectedDateRange : undefined,
      };
      const data = await getRecruiterDashboard(params);
      setDashboardData(data);
    } catch (err) {
      console.error("RECRUITER DASHBOARD ERROR:", err);
      setError(err.response?.data?.message || "Failed to load recruiter analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedRole, selectedDateRange]);

  const summary = dashboardData?.summary || {};
  const topStudents = dashboardData?.topStudents || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const charts = dashboardData?.charts || {};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Dashboard Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>TALENT ACQUISITION & HIRING INTELLIGENCE</div>
            <h1 style={styles.title}>Recruiter Dashboard</h1>
            <p style={styles.subtitle}>
              Track real candidate assessments, dynamic skill rankings, and technical proficiency.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={() => navigate("/recruiter/students")}
              style={styles.secondaryBtn}
            >
              👥 View All Candidates
            </button>
            <button
              onClick={() => navigate("/recruiter/assessments")}
              style={styles.primaryBtn}
            >
              📝 View Assessments
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div style={styles.filterBar}>
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Target Role Filter:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={styles.filterSelect}
            >
              {STANDARD_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>Time Window:</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {(selectedRole !== "All Roles" || selectedDateRange !== "all") && (
            <button
              onClick={() => {
                setSelectedRole("All Roles");
                setSelectedDateRange("all");
              }}
              style={styles.resetFilterBtn}
            >
              ✕ Reset Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && <RecruiterLoadingSkeleton count={6} />}

        {/* Error State */}
        {error && (
          <div style={styles.errorBanner}>
            <p>⚠️ {error}</p>
            <button onClick={fetchDashboard} style={styles.retryBtn}>
              Retry
            </button>
          </div>
        )}

        {/* Summary Analytics Cards */}
        {!loading && !error && (
          <div style={styles.statsGrid}>
            <RecruiterStatCard
              title="Total Students"
              value={summary.totalStudents?.toLocaleString() || "0"}
              subtext="Registered candidate pool"
              icon="👥"
              accentColor="#38bdf8"
            />
            <RecruiterStatCard
              title="Assessments Completed"
              value={summary.assessmentsCompleted?.toLocaleString() || "0"}
              subtext="Submitted technical evaluations"
              icon="✅"
              accentColor="#22c55e"
            />
            <RecruiterStatCard
              title="Average Score"
              value={`${summary.averageScore || 0}%`}
              subtext="Evaluation benchmark across roles"
              icon="📈"
              accentColor={summary.averageScore >= 75 ? "#22c55e" : "#eab308"}
            />
            <RecruiterStatCard
              title="Top Performers"
              value={summary.topPerformers || "0"}
              subtext="Candidates with ≥80% average"
              icon="🏆"
              badgeText="High Talent"
              accentColor="#818cf8"
            />
            <RecruiterStatCard
              title="Active Candidates"
              value={summary.activeCandidates || "0"}
              subtext="Active in evaluation period"
              icon="⚡"
              accentColor="#f59e0b"
            />
            <RecruiterStatCard
              title="Completion Rate"
              value={`${summary.completionRate || 0}%`}
              subtext="Started vs submitted ratio"
              icon="🎯"
              accentColor="#14b8a6"
            />
          </div>
        )}

        {/* Main Content Layout */}
        {!loading && !error && (
          <>
            {/* Top Students Leaderboard */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>🏆 Candidate Leaderboard & Rankings</h3>
                  <p style={styles.sectionSub}>
                    Ranked dynamically by verified assessment scores, accuracy, and technical proficiency.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/recruiter/students?sortBy=highestScore")}
                  style={styles.viewMoreBtn}
                >
                  View All Candidates →
                </button>
              </div>

              {topStudents.length === 0 ? (
                <RecruiterEmptyState
                  title="No candidate assessments completed yet"
                  description="When candidates submit technical assessments in this category, real leaderboard data will appear here."
                />
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Rank</th>
                        <th style={styles.th}>Student Name</th>
                        <th style={styles.th}>Target Role</th>
                        <th style={styles.th}>Assessments</th>
                        <th style={styles.th}>Avg Score</th>
                        <th style={styles.th}>Best Score</th>
                        <th style={styles.th}>Strongest Skill</th>
                        <th style={styles.th}>Last Active</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.thRight}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topStudents.map((student) => (
                        <tr key={student.studentId} style={styles.tr}>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.rankBadge,
                                backgroundColor:
                                  student.rank === 1
                                    ? "rgba(234, 179, 8, 0.2)"
                                    : student.rank === 2
                                    ? "rgba(148, 163, 184, 0.2)"
                                    : student.rank === 3
                                    ? "rgba(180, 83, 9, 0.2)"
                                    : "rgba(30, 41, 59, 0.5)",
                                color:
                                  student.rank === 1
                                    ? "#facc15"
                                    : student.rank === 2
                                    ? "#cbd5e1"
                                    : student.rank === 3
                                    ? "#f97316"
                                    : "#94a3b8",
                              }}
                            >
                              #{student.rank}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.studentNameBlock}>
                              <span style={styles.studentName}>{student.name}</span>
                              <span style={styles.studentEmail}>{student.email}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.rolePill}>{student.targetRole}</span>
                          </td>
                          <td style={styles.td}>
                            <strong style={{ color: "#f8fafc" }}>
                              {student.assessmentsTaken}
                            </strong>{" "}
                            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>taken</span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                fontWeight: "700",
                                color: student.averageScore >= 80 ? "#4ade80" : "#38bdf8",
                              }}
                            >
                              {student.averageScore}%
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontWeight: "700", color: "#f8fafc" }}>
                              {student.bestScore}%
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.skillTag}>{student.strongestSkill}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.dateText}>{student.lastAssessment}</span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.perfBadge,
                                backgroundColor: student.badgeBg,
                                color: student.badgeColor,
                              }}
                            >
                              {student.badge}
                            </span>
                          </td>
                          <td style={styles.tdRight}>
                            <div style={styles.actionBtnGroup}>
                              <button
                                onClick={() =>
                                  navigate(`/recruiter/students/${student.studentId}`)
                                }
                                style={styles.viewPerfBtn}
                              >
                                View Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Performance Analytics Charts Grid */}
            <div style={styles.chartsGrid}>
              {/* Chart 1: Assessment Performance Overview */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>Assessment Performance Overview</h4>
                    <p style={styles.cardSub}>Average, Highest & Lowest scores</p>
                  </div>
                </div>
                <PerformanceOverviewChart data={charts.performanceOverview} />
              </div>

              {/* Chart 2: Students by Target Role */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>Candidates by Target Role</h4>
                    <p style={styles.cardSub}>Evaluations across engineering tracks</p>
                  </div>
                </div>
                <StudentsByRoleChart data={charts.studentsByRole} />
              </div>

              {/* Chart 3: Skill / Topic Performance */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>Skill & Topic Performance</h4>
                    <p style={styles.cardSub}>Candidate proficiency benchmarks</p>
                  </div>
                </div>
                <SkillPerformanceChart data={charts.skillPerformance} />
              </div>

              {/* Chart 4: Assessment Completion Trend */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>Assessment Activity Trend</h4>
                    <p style={styles.cardSub}>Assessments completed over timeline</p>
                  </div>
                </div>
                <CompletionTrendChart data={charts.completionTrend} />
              </div>
            </div>

            {/* Recent Assessment Activity */}
            <div style={styles.sectionCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>⚡ Live Assessment Submissions</h3>
                  <p style={styles.sectionSub}>Recent candidate evaluations and score cards</p>
                </div>
                <button
                  onClick={() => navigate("/recruiter/assessments")}
                  style={styles.viewMoreBtn}
                >
                  View All Activity →
                </button>
              </div>

              {recentActivity.length === 0 ? (
                <RecruiterEmptyState
                  title="No assessment attempts yet"
                  description="Recent test attempts will appear in this log in real time."
                />
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Candidate</th>
                        <th style={styles.th}>Target Role</th>
                        <th style={styles.th}>Assessment</th>
                        <th style={styles.th}>Score</th>
                        <th style={styles.th}>Questions</th>
                        <th style={styles.th}>Time Taken</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.thRight}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity) => (
                        <tr key={activity.id} style={styles.tr}>
                          <td style={styles.td}>
                            <div style={styles.studentNameBlock}>
                              <span style={styles.studentName}>
                                {activity.studentName}
                              </span>
                              <span style={styles.studentEmail}>{activity.email}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.rolePill}>{activity.targetRole}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#f8fafc", fontWeight: "500" }}>
                              {activity.assessment}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.scoreHighlight}>
                              {activity.score}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#cbd5e1" }}>{activity.questions}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#94a3b8" }}>{activity.timeTaken}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.statusCompletedBadge}>
                              ✓ {activity.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.dateText}>{activity.date}</span>
                          </td>
                          <td style={styles.tdRight}>
                            <button
                              onClick={() => setSelectedAssessmentId(activity.id)}
                              style={styles.inspectBtn}
                            >
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Assessment Drill-Down Modal */}
      {selectedAssessmentId && (
        <AssessmentDetailModal
          assessmentId={selectedAssessmentId}
          onClose={() => setSelectedAssessmentId(null)}
        />
      )}
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
    gap: "1.75rem",
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
    letterSpacing: "1px",
    marginBottom: "0.4rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "0 0 0.4rem 0",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "0.75rem",
  },
  primaryBtn: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  secondaryBtn: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "0.85rem 1.25rem",
    flexWrap: "wrap",
  },
  filterItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  filterLabel: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#94a3b8",
  },
  filterSelect: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.4rem 0.85rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    outline: "none",
  },
  resetFilterBtn: {
    backgroundColor: "transparent",
    border: "1px solid #475569",
    color: "#cbd5e1",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
  },
  sectionTitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 0.25rem 0",
  },
  sectionSub: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: 0,
  },
  viewMoreBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  tableResponsive: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #1e293b",
    color: "#94a3b8",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },
  thRight: {
    textAlign: "right",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #1e293b",
    color: "#94a3b8",
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #1e293b",
  },
  td: {
    padding: "0.85rem 1rem",
    color: "#cbd5e1",
    verticalAlign: "middle",
  },
  tdRight: {
    padding: "0.85rem 1rem",
    textAlign: "right",
    verticalAlign: "middle",
  },
  rankBadge: {
    padding: "0.2rem 0.5rem",
    borderRadius: "6px",
    fontWeight: "800",
    fontSize: "0.8rem",
  },
  studentNameBlock: {
    display: "flex",
    flexDirection: "column",
  },
  studentName: {
    fontWeight: "600",
    color: "#f8fafc",
  },
  studentEmail: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  rolePill: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
  },
  skillTag: {
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  dateText: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  perfBadge: {
    padding: "0.25rem 0.55rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  actionBtnGroup: {
    display: "flex",
    justifyContent: "flex-end",
  },
  viewPerfBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#38bdf8",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "1.25rem",
  },
  chartCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.25rem",
  },
  cardHeader: {
    marginBottom: "1rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 0.2rem 0",
  },
  cardSub: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    margin: 0,
  },
  scoreHighlight: {
    fontWeight: "700",
    color: "#38bdf8",
  },
  statusCompletedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  inspectBtn: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    padding: "1rem 1.5rem",
    borderRadius: "10px",
    color: "#fca5a5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  retryBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "0.4rem 0.85rem",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default RecruiterDashboard;
