import { useEffect, useState } from "react";
import { getRecruiterAssessment } from "../../services/recruiterService";

function AssessmentDetailModal({ assessmentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "questions"

  useEffect(() => {
    const fetchDetail = async () => {
      if (!assessmentId) return;
      try {
        setLoading(true);
        setError("");
        const res = await getRecruiterAssessment(assessmentId);
        setData(res.assessment);
      } catch (err) {
        console.error("FAILED TO LOAD ASSESSMENT DETAIL:", err);
        setError(err.response?.data?.message || "Failed to load assessment report");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [assessmentId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const monitoringSummary = data?.monitoringSummary || {};

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.headerBadge}>CANDIDATE ASSESSMENT REPORT</div>
            <h2 style={styles.title}>
              {data?.targetRole || "Technical Assessment"}
            </h2>
            <p style={styles.subtitle}>
              Candidate: <strong style={{ color: "#38bdf8" }}>{data?.student?.name}</strong> ({data?.student?.email})
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabRow}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "overview" ? styles.tabBtnActive : {}),
            }}
          >
            📊 Summary & Analytics
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            style={{
              ...styles.tabBtn,
              ...(activeTab === "questions" ? styles.tabBtnActive : {}),
            }}
          >
            📝 Question Review ({data?.questionReview?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div style={styles.body}>
          {loading && (
            <div style={styles.centerBox}>
              <div style={styles.spinner} />
              <p style={{ color: "#94a3b8" }}>Loading detailed assessment results...</p>
            </div>
          )}

          {error && (
            <div style={styles.errorAlert}>
              <p>{error}</p>
              <button onClick={onClose} style={styles.retryCloseBtn}>
                Close
              </button>
            </div>
          )}

          {!loading && !error && data && activeTab === "overview" && (
            <div style={styles.tabContent}>
              {/* Summary Metrics Grid */}
              <div style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                  <span style={styles.metricLabel}>Overall Score</span>
                  <div style={styles.metricValue}>
                    {data.score} <span style={styles.metricSub}>/ {data.totalQuestions}</span>
                  </div>
                </div>

                <div style={styles.metricCard}>
                  <span style={styles.metricLabel}>Percentage</span>
                  <div
                    style={{
                      ...styles.metricValue,
                      color: data.percentage >= 70 ? "#22c55e" : "#eab308",
                    }}
                  >
                    {data.percentage}%
                  </div>
                </div>

                <div style={styles.metricCard}>
                  <span style={styles.metricLabel}>Time Taken</span>
                  <div style={styles.metricValue}>{data.timeTaken}</div>
                </div>

                <div style={styles.metricCard}>
                  <span style={styles.metricLabel}>Completion Date</span>
                  <div style={styles.metricValueDate}>{data.formattedDate}</div>
                </div>
              </div>

              {/* Proctoring & Integrity Summary */}
              {(() => {
                const tabSwitchesCount = monitoringSummary.tabSwitches || 0;
                const isReviewRequired =
                  tabSwitchesCount > 0 ||
                  monitoringSummary.flagCount > 0 ||
                  (data.monitoringEvents && data.monitoringEvents.length > 0);
                const eventsList = data.monitoringEvents || [];

                return (
                  <div
                    style={{
                      ...styles.integrityCard,
                      border: isReviewRequired ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid #1e293b",
                    }}
                  >
                    <div style={styles.integrityHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "1.1rem" }}>
                          {isReviewRequired ? "⚠️" : "🛡️"}
                        </span>
                        <strong style={{ fontSize: "0.95rem" }}>Assessment Integrity Log</strong>
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
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Difficulty Breakdown</h3>
                <div style={styles.diffGrid}>
                  {(data.difficultyBreakdown || []).map((d) => (
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
                              d.level === "Easy" ? "#22c55e" : d.level === "Medium" ? "#38bdf8" : "#f43f5e",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Breakdown */}
              {data.topicPerformance && data.topicPerformance.length > 0 && (
                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>Topic-wise Performance</h3>
                  <div style={styles.topicList}>
                    {data.topicPerformance.map((tp, idx) => (
                      <div key={idx} style={styles.topicRow}>
                        <div style={styles.topicHeader}>
                          <span style={{ fontWeight: "600", color: "#f8fafc" }}>{tp.topic}</span>
                          <span
                            style={{
                              color: tp.percentage >= 70 ? "#4ade80" : "#fca5a5",
                              fontWeight: "700",
                            }}
                          >
                            {tp.correct} / {tp.total} ({tp.percentage}%)
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

              {/* Strengths & Weaknesses */}
              <div style={styles.insightGrid}>
                {data.strengths && data.strengths.length > 0 && (
                  <div style={styles.insightBox}>
                    <h4 style={{ color: "#4ade80", margin: "0 0 0.5rem 0" }}>💪 Strong Skills</h4>
                    <ul style={styles.bulletList}>
                      {data.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.weaknesses && data.weaknesses.length > 0 && (
                  <div style={styles.insightBox}>
                    <h4 style={{ color: "#fca5a5", margin: "0 0 0.5rem 0" }}>🎯 Needs Improvement</h4>
                    <ul style={styles.bulletList}>
                      {data.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && data && activeTab === "questions" && (
            <div style={styles.tabContent}>
              {data.questionReview && data.questionReview.length > 0 ? (
                data.questionReview.map((q) => {
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
                          <span style={styles.qNumber}>Q{q.questionIndex}</span>
                          <span style={styles.qTypeBadge}>
                            {isCoding ? "💻 Coding" : "📝 MCQ"}
                          </span>
                          <span style={styles.qTopicBadge}>{q.topic}</span>
                          <span style={styles.qDiffBadge}>{q.difficulty}</span>
                        </div>
                        <span
                          style={{
                            ...styles.qStatusPill,
                            backgroundColor: q.isCorrect ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
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
                            <span style={styles.qAnswerLabel}>Candidate's Answer: </span>
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
                <p style={{ color: "#94a3b8" }}>No question details available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "1.5rem",
  },
  modal: {
    backgroundColor: "#0b1329",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "860px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
    overflow: "hidden",
  },
  header: {
    padding: "1.5rem 1.75rem",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#0f172a",
  },
  headerBadge: {
    fontSize: "0.7rem",
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "1.45rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  subtitle: {
    margin: 0,
    fontSize: "0.88rem",
    color: "#94a3b8",
  },
  closeBtn: {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1rem",
  },
  tabRow: {
    display: "flex",
    borderBottom: "1px solid #1e293b",
    backgroundColor: "#090d16",
    padding: "0 1.5rem",
  },
  tabBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    padding: "0.85rem 1.25rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    color: "#38bdf8",
    borderBottom: "2px solid #38bdf8",
  },
  body: {
    padding: "1.5rem 1.75rem",
    overflowY: "auto",
    flex: 1,
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
  },
  metricCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1rem",
  },
  metricLabel: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#f8fafc",
    marginTop: "4px",
  },
  metricValueDate: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: "6px",
  },
  metricSub: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  integrityCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
  },
  integrityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  trustBadge: {
    padding: "0.2rem 0.55rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "800",
  },
  integrityStats: {
    display: "flex",
    gap: "2rem",
    fontSize: "0.85rem",
    color: "#cbd5e1",
  },
  integrityDim: {
    color: "#64748b",
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  sectionTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#f8fafc",
  },
  diffGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  diffCard: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  diffHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
  },
  diffLabel: {
    color: "#94a3b8",
  },
  track: {
    height: "6px",
    backgroundColor: "#1e293b",
    borderRadius: "3px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "3px",
  },
  topicList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  topicRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  topicHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.88rem",
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  insightBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  bulletList: {
    margin: 0,
    paddingLeft: "1.2rem",
    fontSize: "0.88rem",
    color: "#cbd5e1",
  },
  questionCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  qTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qNumber: {
    fontSize: "0.85rem",
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
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
  },
  qDiffBadge: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    color: "#94a3b8",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
  },
  qStatusPill: {
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  qText: {
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: "1.5",
    color: "#f8fafc",
    fontWeight: "500",
  },
  qAnswerDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    fontSize: "0.88rem",
  },
  qAnswerLabel: {
    color: "#94a3b8",
  },
  explanationBox: {
    backgroundColor: "#090d16",
    borderLeft: "3px solid #38bdf8",
    padding: "0.6rem 0.85rem",
    borderRadius: "6px",
    color: "#cbd5e1",
    fontSize: "0.82rem",
    lineHeight: "1.4",
  },
  codeSnippetPre: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "0.75rem",
    color: "#38bdf8",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    overflowX: "auto",
    margin: "0.3rem 0",
  },
  centerBox: {
    textAlign: "center",
    padding: "3rem",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #1e293b",
    borderTopColor: "#38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  errorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    padding: "1rem",
    borderRadius: "8px",
    color: "#fca5a5",
    textAlign: "center",
  },
  retryCloseBtn: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "0.4rem 0.85rem",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
};

export default AssessmentDetailModal;
