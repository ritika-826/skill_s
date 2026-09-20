import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecruiterAssessment } from "../../services/recruiterService";
import RecruiterLoadingSkeleton from "../../components/recruiter/RecruiterLoadingSkeleton";

function RecruiterAssessmentDetail() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getRecruiterAssessment(assessmentId);
        setAssessment(res.assessment);
      } catch (err) {
        console.error("LOAD ASSESSMENT ERROR:", err);
        setError(err.response?.data?.message || "Failed to load assessment report");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const monitoringSummary = assessment?.monitoringSummary || {};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Navigation Breadcrumb */}
        <div style={styles.breadcrumbRow}>
          <button onClick={() => navigate("/recruiter/assessments")} style={styles.backBtn}>
            ← Back to Assessments
          </button>
          <span style={styles.crumbDivider}>/</span>
          <span style={styles.crumbActive}>Assessment Breakdown</span>
        </div>

        {loading && <RecruiterLoadingSkeleton count={4} />}

        {error && (
          <div style={styles.errorAlert}>
            <p>⚠️ {error}</p>
            <button onClick={() => navigate("/recruiter/assessments")} style={styles.backLinkBtn}>
              Return to Assessments List
            </button>
          </div>
        )}

        {!loading && !error && assessment && (
          <>
            {/* Header Card */}
            <div style={styles.headerCard}>
              <div>
                <span style={styles.badge}>TECHNICAL EVALUATION REPORT</span>
                <h1 style={styles.title}>{assessment.targetRole} Assessment</h1>
                <p style={styles.subtitle}>
                  Candidate:{" "}
                  <strong style={{ color: "#38bdf8" }}>{assessment.student?.name}</strong> (
                  {assessment.student?.email}) • Submitted: {assessment.formattedDate}
                </p>
              </div>

              <div style={styles.headerScorePill}>
                <span style={styles.scoreNumber}>{assessment.percentage}%</span>
                <span style={styles.scoreLabel}>Overall Accuracy</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabNav}>
              <button
                onClick={() => setActiveTab("overview")}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === "overview" ? styles.tabBtnActive : {}),
                }}
              >
                📊 Score & Skill Analytics
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === "questions" ? styles.tabBtnActive : {}),
                }}
              >
                📝 Full Question Review ({assessment.questionReview?.length || 0})
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div style={styles.tabGrid}>
                {/* Metric Summary Grid */}
                <div style={styles.metricsGrid}>
                  <div style={styles.metricBox}>
                    <span style={styles.metricBoxLabel}>Raw Score</span>
                    <span style={styles.metricBoxVal}>
                      {assessment.score} / {assessment.totalQuestions}
                    </span>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricBoxLabel}>Correct Answers</span>
                    <span style={{ ...styles.metricBoxVal, color: "#4ade80" }}>
                      {assessment.correct}
                    </span>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricBoxLabel}>Incorrect Answers</span>
                    <span style={{ ...styles.metricBoxVal, color: "#fca5a5" }}>
                      {assessment.incorrect}
                    </span>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricBoxLabel}>Time Taken</span>
                    <span style={styles.metricBoxVal}>{assessment.timeTaken}</span>
                  </div>
                </div>

                {/* Proctoring & Integrity Summary */}
                {(() => {
                  const tabSwitchesCount = monitoringSummary.tabSwitches || 0;
                  const isReviewRequired =
                    tabSwitchesCount > 0 ||
                    monitoringSummary.flagCount > 0 ||
                    (assessment.monitoringEvents && assessment.monitoringEvents.length > 0);
                  const eventsList = assessment.monitoringEvents || [];

                  return (
                    <div
                      style={{
                        ...styles.integrityCard,
                        border: isReviewRequired ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid #1e293b",
                      }}
                    >
                      <div style={styles.integrityHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "1.2rem" }}>
                            {isReviewRequired ? "⚠️" : "🛡️"}
                          </span>
                          <strong style={{ fontSize: "1rem", color: "#f8fafc" }}>
                            Assessment Integrity Verification Log
                          </strong>
                        </div>
                        <span
                          style={{
                            ...styles.trustBadge,
                            backgroundColor: isReviewRequired ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.15)",
                            color: isReviewRequired ? "#f87171" : "#4ade80",
                            border: isReviewRequired ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          {isReviewRequired ? "⚠ Review Required" : "✓ High Trust Verified"}
                        </span>
                      </div>
                      <div style={styles.integrityStats}>
                        <div>
                          <span style={styles.integrityDim}>Tab Switches:</span>{" "}
                          <strong style={{ color: tabSwitchesCount > 0 ? "#f87171" : "#f8fafc" }}>
                            {tabSwitchesCount}
                          </strong>
                        </div>
                        <div>
                          <span style={styles.integrityDim}>Focus Loss Events:</span>{" "}
                          <strong>{monitoringSummary.focusLostCount || 0}</strong>
                        </div>
                        <div>
                          <span style={styles.integrityDim}>Camera Disconnections:</span>{" "}
                          <strong>{monitoringSummary.cameraDisconnections || 0}</strong>
                        </div>
                      </div>

                      {isReviewRequired && eventsList.length > 0 ? (
                        <div style={{ marginTop: "0.85rem", paddingTop: "0.6rem", borderTop: "1px solid #1e293b" }}>
                          <span style={{ fontSize: "0.78rem", color: "#fca5a5", fontWeight: "700", display: "block", marginBottom: "0.3rem" }}>
                            Recorded Integrity Events:
                          </span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {eventsList.map((ev, i) => {
                              const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "N/A";
                              return (
                                <div key={i} style={{ fontSize: "0.8rem", color: "#f87171", display: "flex", gap: "8px" }}>
                                  <span style={{ fontFamily: "monospace", color: "#94a3b8" }}>{timeStr}</span>
                                  <span>—</span>
                                  <strong>{ev.type || ev.eventType || "TAB_SWITCH"}</strong>
                                  {ev.details && <span style={{ color: "#94a3b8" }}>({ev.details})</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: "0.6rem", paddingTop: "0.4rem", borderTop: "1px solid #1e293b", fontSize: "0.8rem", color: "#4ade80" }}>
                          ✓ No monitoring issues detected during assessment.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Difficulty Breakdown */}
                <div style={styles.card}>
                  <h3 style={styles.cardTitle}>Difficulty-wise Accuracy</h3>
                  <div style={styles.diffGrid}>
                    {(assessment.difficultyBreakdown || []).map((d) => (
                      <div key={d.level} style={styles.diffCard}>
                        <div style={styles.diffHeader}>
                          <span style={styles.diffLabel}>{d.level}</span>
                          <span style={{ fontWeight: "700", color: "#f8fafc" }}>
                            {d.correct}/{d.total} ({d.percentage}%)
                          </span>
                        </div>
                        <div style={styles.track}>
                          <div
                            style={{
                              ...styles.fill,
                              width: `${d.percentage}%`,
                              backgroundColor:
                                d.level === "Easy"
                                  ? "#22c55e"
                                  : d.level === "Medium"
                                  ? "#38bdf8"
                                  : "#f43f5e",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Breakdown */}
                {assessment.topicPerformance && assessment.topicPerformance.length > 0 && (
                  <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Topic-wise Performance</h3>
                    <div style={styles.topicList}>
                      {assessment.topicPerformance.map((tp, i) => (
                        <div key={i} style={styles.topicItem}>
                          <div style={styles.topicLabelRow}>
                            <span style={{ fontWeight: "600", color: "#f8fafc" }}>{tp.topic}</span>
                            <span
                              style={{
                                color: tp.percentage >= 70 ? "#4ade80" : "#fca5a5",
                                fontWeight: "700",
                              }}
                            >
                              {tp.correct}/{tp.total} ({tp.percentage}%)
                            </span>
                          </div>
                          <div style={styles.track}>
                            <div
                              style={{
                                ...styles.fill,
                                width: `${tp.percentage}%`,
                                backgroundColor: tp.percentage >= 70 ? "#22c55e" : "#ef4444",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Question Review */}
            {activeTab === "questions" && (
              <div style={styles.questionsContainer}>
                {assessment.questionReview && assessment.questionReview.length > 0 ? (
                  assessment.questionReview.map((q) => {
                    const isCoding = q.questionType === "coding" || q.isCoding;
                    return (
                      <div
                        key={q.questionIndex}
                        style={{
                          ...styles.questionCard,
                          borderLeft: `4px solid ${q.isCorrect ? "#22c55e" : "#ef4444"}`,
                        }}
                      >
                        <div style={styles.qTopRow}>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={styles.qNumber}>Question {q.questionIndex}</span>
                            <span style={styles.qTypeBadge}>
                              {isCoding ? "💻 Coding" : "📝 MCQ"}
                            </span>
                            <span style={styles.qTopicBadge}>{q.topic}</span>
                            <span style={styles.qDiffBadge}>{q.difficulty}</span>
                          </div>
                          <span
                            style={{
                              ...styles.qStatusPill,
                              backgroundColor: q.isCorrect
                                ? "rgba(34, 197, 94, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                              color: q.isCorrect ? "#4ade80" : "#fca5a5",
                            }}
                          >
                            {q.isCorrect ? "✓ Correct / Passed" : "✗ Incorrect"}
                          </span>
                        </div>

                        <p style={styles.qText}>{q.questionText}</p>

                        {/* Non-coding review */}
                        {!isCoding && (
                          <div style={styles.qAnswerDetails}>
                            <div>
                              <span style={styles.qAnswerLabel}>Candidate Answer: </span>
                              <span
                                style={{
                                  fontWeight: "600",
                                  color: q.isCorrect ? "#4ade80" : "#fca5a5",
                                }}
                              >
                                {q.candidateAnswer || "Not Answered"}
                              </span>
                            </div>

                            {!q.isCorrect && (
                              <div>
                                <span style={styles.qAnswerLabel}>Correct Answer: </span>
                                <span style={{ fontWeight: "600", color: "#4ade80" }}>
                                  {q.correctAnswer}
                                </span>
                              </div>
                            )}

                            {q.explanation && (
                              <div style={styles.explanationBox}>
                                <strong>Rationale: </strong>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Coding review */}
                        {isCoding && (
                          <div style={styles.qAnswerDetails}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
                              <span>Language: <strong>{q.language || "javascript"}</strong></span>
                              {q.testCasesPassed !== undefined && (
                                <span style={{ color: q.isCorrect ? "#4ade80" : "#fca5a5", fontWeight: "700" }}>
                                  {q.testCasesPassed} / {q.testCasesTotal || 3} Test Cases Passed
                                </span>
                              )}
                            </div>

                            <pre style={styles.codeSnippetPre}>
                              <code>{q.submittedCode || q.candidateAnswer || "// No code submitted"}</code>
                            </pre>

                            {q.explanation && (
                              <div style={styles.explanationBox}>
                                <strong>Solution Approach: </strong>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: "#94a3b8" }}>No question details found.</p>
                )}
              </div>
            )}
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
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  breadcrumbRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  crumbDivider: {
    color: "#475569",
  },
  crumbActive: {
    color: "#94a3b8",
  },
  headerCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.75rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  badge: {
    fontSize: "0.72rem",
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: "0.5px",
    display: "block",
    marginBottom: "0.3rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "0 0 0.4rem 0",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#94a3b8",
  },
  headerScorePill: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    padding: "0.85rem 1.5rem",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#38bdf8",
  },
  scoreLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  tabNav: {
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
    padding: "0.5rem 1rem",
    cursor: "pointer",
    borderRadius: "8px",
  },
  tabBtnActive: {
    color: "#38bdf8",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  },
  tabGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  metricBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  metricBoxLabel: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: "0.4rem",
  },
  metricBoxVal: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  integrityCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  integrityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  trustBadge: {
    padding: "0.25rem 0.65rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "800",
  },
  integrityStats: {
    display: "flex",
    gap: "2.5rem",
    fontSize: "0.9rem",
    color: "#cbd5e1",
  },
  integrityDim: {
    color: "#64748b",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 1.25rem 0",
  },
  diffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.25rem",
  },
  diffCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  diffHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.88rem",
  },
  diffLabel: {
    color: "#94a3b8",
  },
  track: {
    height: "8px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "4px",
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
  questionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  questionCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  qTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qNumber: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#94a3b8",
  },
  qTypeBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  qTopicBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    color: "#94a3b8",
    padding: "0.2rem 0.55rem",
    borderRadius: "4px",
    fontSize: "0.78rem",
  },
  qDiffBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    color: "#94a3b8",
    padding: "0.2rem 0.55rem",
    borderRadius: "4px",
    fontSize: "0.78rem",
  },
  qStatusPill: {
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  qText: {
    fontSize: "1.05rem",
    fontWeight: "600",
    color: "#f8fafc",
    lineHeight: "1.4",
    margin: 0,
  },
  qAnswerDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    fontSize: "0.95rem",
  },
  qAnswerLabel: {
    color: "#94a3b8",
  },
  explanationBox: {
    backgroundColor: "#090d16",
    borderLeft: "3px solid #38bdf8",
    padding: "0.75rem 1rem",
    borderRadius: "6px",
    color: "#cbd5e1",
    fontSize: "0.88rem",
    lineHeight: "1.4",
  },
  codeSnippetPre: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "0.85rem",
    color: "#38bdf8",
    fontFamily: "monospace",
    fontSize: "0.88rem",
    overflowX: "auto",
    margin: "0.4rem 0",
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    padding: "1.5rem",
    borderRadius: "12px",
    color: "#fca5a5",
    textAlign: "center",
  },
  backLinkBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "0.75rem",
  },
};

export default RecruiterAssessmentDetail;
