import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecruiterStudent } from "../../services/recruiterService";
import AssessmentDetailModal from "../../components/recruiter/AssessmentDetailModal";
import RecruiterLoadingSkeleton from "../../components/recruiter/RecruiterLoadingSkeleton";

function RecruiterStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getRecruiterStudent(studentId);
        setData(res);
      } catch (err) {
        console.error("LOAD CANDIDATE PROFILE ERROR:", err);
        setError(err.response?.data?.message || "Failed to load candidate performance profile");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const student = data?.student;
  const assessmentHistory = data?.assessmentHistory || [];
  const topicPerformance = data?.topicPerformance || [];
  const skillsSummary = data?.skillsSummary || { strongSkills: [], needsImprovement: [] };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Navigation Breadcrumb */}
        <div style={styles.breadcrumbRow}>
          <button onClick={() => navigate("/recruiter/students")} style={styles.backBtn}>
            ← Back to All Candidates
          </button>
          <span style={styles.crumbDivider}>/</span>
          <span style={styles.crumbActive}>Candidate Profile</span>
        </div>

        {loading && <RecruiterLoadingSkeleton count={4} />}

        {error && (
          <div style={styles.errorAlert}>
            <p>⚠️ {error}</p>
            <button onClick={() => navigate("/recruiter/students")} style={styles.backLinkBtn}>
              Return to Candidates
            </button>
          </div>
        )}

        {!loading && !error && student && (
          <>
            {/* Student Profile Summary Header Card */}
            <div style={styles.profileHeaderCard}>
              <div style={styles.avatarCol}>
                <div style={styles.avatarLarge}>
                  {student.name ? student.name.charAt(0).toUpperCase() : "C"}
                </div>
              </div>

              <div style={styles.infoCol}>
                <div style={styles.nameRow}>
                  <h1 style={styles.studentName}>{student.name}</h1>
                  <span
                    style={{
                      ...styles.badgePill,
                      backgroundColor: student.badgeBg,
                      color: student.badgeColor,
                    }}
                  >
                    {student.badge}
                  </span>
                </div>

                <div style={styles.metaRow}>
                  <span style={styles.metaItem}>📧 {student.email}</span>
                  <span style={styles.metaDivider}>•</span>
                  <span style={styles.metaItem}>🎯 Track: <strong>{student.targetRole}</strong></span>
                  <span style={styles.metaDivider}>•</span>
                  <span style={styles.metaItem}>
                    📅 Joined:{" "}
                    {new Date(student.joinedDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Quick Metrics Columns */}
              <div style={styles.statsSummaryGrid}>
                <div style={styles.statMiniCard}>
                  <span style={styles.statMiniLabel}>Completed</span>
                  <span style={styles.statMiniVal}>{student.assessmentsCompleted}</span>
                  <span style={styles.statMiniSub}>assessments</span>
                </div>

                <div style={styles.statMiniCard}>
                  <span style={styles.statMiniLabel}>Avg Score</span>
                  <span
                    style={{
                      ...styles.statMiniVal,
                      color: student.averageScore >= 75 ? "#4ade80" : "#38bdf8",
                    }}
                  >
                    {student.averageScore}%
                  </span>
                  <span style={styles.statMiniSub}>accuracy</span>
                </div>

                <div style={styles.statMiniCard}>
                  <span style={styles.statMiniLabel}>Best Score</span>
                  <span style={{ ...styles.statMiniVal, color: "#818cf8" }}>
                    {student.bestScore}%
                  </span>
                  <span style={styles.statMiniSub}>peak result</span>
                </div>
              </div>
            </div>

            {/* Topic-Wise Performance & Skill Strengths Grid */}
            <div style={styles.twoColGrid}>
              {/* Left Column: Topic-wise Performance */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>📊 Topic-Wise Performance</h3>
                  <span style={styles.cardBadge}>Aggregated Skills</span>
                </div>

                {topicPerformance.length === 0 ? (
                  <p style={{ color: "#94a3b8" }}>No skill assessments recorded.</p>
                ) : (
                  <div style={styles.topicList}>
                    {topicPerformance.map((tp) => {
                      const color =
                        tp.percentage >= 80
                          ? "#22c55e"
                          : tp.percentage >= 65
                          ? "#38bdf8"
                          : tp.percentage >= 50
                          ? "#eab308"
                          : "#ef4444";

                      return (
                        <div key={tp.topic} style={styles.topicItem}>
                          <div style={styles.topicLabelRow}>
                            <span style={styles.topicName}>{tp.topic}</span>
                            <span style={{ color, fontWeight: "700", fontSize: "0.88rem" }}>
                              {tp.correct}/{tp.total} ({tp.percentage}%)
                            </span>
                          </div>
                          <div style={styles.progressTrack}>
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${tp.percentage}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Strengths & Weak Areas */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>🎯 Competency Evaluation</h3>
                  <span style={styles.cardBadge}>Hiring Insights</span>
                </div>

                <div style={styles.skillsSection}>
                  <div style={styles.skillBoxPositive}>
                    <div style={styles.skillBoxHeader}>
                      <span style={{ fontSize: "1.1rem" }}>💪</span>
                      <h4 style={{ color: "#4ade80", margin: 0, fontSize: "0.95rem" }}>
                        Strong Skills (≥70%)
                      </h4>
                    </div>
                    {skillsSummary.strongSkills.length === 0 ? (
                      <p style={styles.emptyNote}>No topics marked strong yet.</p>
                    ) : (
                      <div style={styles.skillTagsWrap}>
                        {skillsSummary.strongSkills.map((skill, idx) => (
                          <span key={idx} style={styles.strongSkillPill}>
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.skillBoxNegative}>
                    <div style={styles.skillBoxHeader}>
                      <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                      <h4 style={{ color: "#fca5a5", margin: 0, fontSize: "0.95rem" }}>
                        Needs Improvement (&lt;70%)
                      </h4>
                    </div>
                    {skillsSummary.needsImprovement.length === 0 ? (
                      <p style={styles.emptyNote}>Outstanding! No weak areas identified.</p>
                    ) : (
                      <div style={styles.skillTagsWrap}>
                        {skillsSummary.needsImprovement.map((skill, idx) => (
                          <span key={idx} style={styles.weakSkillPill}>
                            • {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment History Table */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>📝 Assessment History</h3>
                  <p style={styles.cardSub}>Chronological record of completed technical tests</p>
                </div>
              </div>

              {assessmentHistory.length === 0 ? (
                <p style={{ color: "#94a3b8", padding: "1rem" }}>
                  This student has not completed any assessments yet.
                </p>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Assessment</th>
                        <th style={styles.th}>Target Role</th>
                        <th style={styles.th}>Score</th>
                        <th style={styles.th}>Accuracy</th>
                        <th style={styles.th}>Time Taken</th>
                        <th style={styles.th}>Difficulty</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.thRight}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessmentHistory.map((item) => (
                        <tr key={item.id} style={styles.tr}>
                          <td style={styles.td}>
                            <strong style={{ color: "#f8fafc" }}>
                              {item.assessmentName}
                            </strong>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.rolePill}>{item.targetRole}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#cbd5e1" }}>{item.score}</span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                fontWeight: "700",
                                color: item.percentage >= 70 ? "#4ade80" : "#fca5a5",
                              }}
                            >
                              {item.percentage}%
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#94a3b8" }}>{item.timeTaken}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.diffBadge}>{item.difficulty}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                              {item.relativeDate}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.statusCompletedBadge}>
                              ✓ {item.status}
                            </span>
                          </td>
                          <td style={styles.tdRight}>
                            <button
                              onClick={() => setSelectedAssessmentId(item.id)}
                              style={styles.inspectBtn}
                            >
                              View Details →
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

      {/* Drill-down Assessment Detail Modal */}
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
    maxWidth: "1350px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.75rem",
  },
  breadcrumbRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "0.9rem",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
  },
  crumbDivider: {
    color: "#64748b",
  },
  crumbActive: {
    color: "#94a3b8",
  },
  profileHeaderCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    flexWrap: "wrap",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
  },
  avatarCol: {
    flexShrink: 0,
  },
  avatarLarge: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.9rem",
    fontWeight: "800",
  },
  infoCol: {
    flex: 1,
    minWidth: "260px",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.85rem",
    flexWrap: "wrap",
  },
  studentName: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  badgePill: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
    fontSize: "0.88rem",
    color: "#94a3b8",
  },
  metaItem: {
    color: "#cbd5e1",
  },
  metaDivider: {
    color: "#475569",
  },
  statsSummaryGrid: {
    display: "flex",
    gap: "1.25rem",
    flexWrap: "wrap",
  },
  statMiniCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "0.9rem 1.4rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "110px",
  },
  statMiniLabel: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  statMiniVal: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "2px 0",
  },
  statMiniSub: {
    fontSize: "0.7rem",
    color: "#64748b",
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
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.25rem",
  },
  cardTitle: {
    margin: "0 0 2px 0",
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  cardSub: {
    margin: 0,
    fontSize: "0.82rem",
    color: "#94a3b8",
  },
  cardBadge: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  topicList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  topicItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  topicLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  topicName: {
    fontWeight: "600",
    color: "#f8fafc",
  },
  progressTrack: {
    height: "8px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
  },
  skillsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  skillBoxPositive: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    borderRadius: "12px",
    padding: "1.2rem",
  },
  skillBoxNegative: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    borderRadius: "12px",
    padding: "1.2rem",
  },
  skillBoxHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.85rem",
  },
  skillTagsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  strongSkillPill: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#4ade80",
    padding: "0.3rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  weakSkillPill: {
    backgroundColor: "rgba(239, 68, 68, 0.18)",
    color: "#fca5a5",
    padding: "0.3rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  emptyNote: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#94a3b8",
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
    padding: "0.85rem 1rem",
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    borderBottom: "1px solid #1e293b",
    whiteSpace: "nowrap",
  },
  thRight: {
    padding: "0.85rem 1rem",
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    borderBottom: "1px solid #1e293b",
    textAlign: "right",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #1e293b",
  },
  td: {
    padding: "1rem 1rem",
    fontSize: "0.9rem",
    verticalAlign: "middle",
  },
  tdRight: {
    padding: "1rem 1rem",
    fontSize: "0.9rem",
    verticalAlign: "middle",
    textAlign: "right",
  },
  rolePill: {
    display: "inline-block",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    padding: "0.2rem 0.55rem",
    borderRadius: "10px",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  diffBadge: {
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    padding: "0.2rem 0.5rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
  },
  statusCompletedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    padding: "0.2rem 0.55rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  inspectBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    color: "#38bdf8",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "1.5rem",
    borderRadius: "12px",
    textAlign: "center",
  },
  backLinkBtn: {
    marginTop: "0.75rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.5rem 1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default RecruiterStudentDetail;
