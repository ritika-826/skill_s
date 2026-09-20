import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getResult } from "../services/resultService";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [result, setResult] = useState(
    location.state?.result?.result || location.state?.result || null
  );
  const [loading, setLoading] = useState(!result && Boolean(id));
  const [error, setError] = useState("");

  const role = location.state?.role || result?.role || result?.quiz?.role || "Technical Role";

  useEffect(() => {
    const loadResult = async () => {
      if (!id || result) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getResult(id);
        console.log("FULL RESULT LOADED:", data);
        setResult(data.result);
      } catch (err) {
        console.error("GET RESULT ERROR:", err);
        setError(err.response?.data?.message || "Unable to load assessment result");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <h2 style={{ color: "#38bdf8", marginTop: "1rem" }}>Evaluating Assessment Results...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.card}>
          <h2 style={{ color: "#ef4444" }}>Unable to Load Result</h2>
          <p style={{ color: "#94a3b8" }}>{error}</p>
          <button onClick={() => navigate("/dashboard")} style={styles.primaryBtn}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.card}>
          <h2>No Assessment Result Found</h2>
          <button onClick={() => navigate("/quiz-setup")} style={styles.primaryBtn}>
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const score = result.score || 0;
  const totalQuestions = result.totalQuestions || result.answers?.length || 20;
  const percentage = result.percentage || 0;
  const incorrect = Math.max(0, totalQuestions - score);

  // Format time taken
  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  let performanceTitle = "Don't Give Up! Keep Learning!";
  let performanceColor = "#ef4444";
  if (percentage >= 80) {
    performanceTitle = "Excellent Performance!";
    performanceColor = "#22c55e";
  } else if (percentage >= 60) {
    performanceTitle = "Good Performance!";
    performanceColor = "#38bdf8";
  } else if (percentage >= 40) {
    performanceTitle = "Keep Practicing!";
    performanceColor = "#eab308";
  }

  const topicPerformance = result.topicPerformance || [];
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];
  const recommendations = result.recommendations || [];
  const monitoringSummary = result.monitoringSummary || {};

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerBadge}>OFFICIAL ASSESSMENT REPORT</div>
          <h1 style={styles.title}>{role} Assessment Report</h1>
          <p style={{ color: "#94a3b8", margin: "4px 0 0 0" }}>
            Skill-Specific Evaluation Summary, Technical Scoring & Integrity Verification
          </p>
        </header>

        {/* Top Metric Cards */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Overall Score</span>
            <div style={styles.metricValue}>
              {score} <span style={styles.metricSub}>/ {totalQuestions}</span>
            </div>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Percentage</span>
            <div style={{ ...styles.metricValue, color: performanceColor }}>
              {percentage}%
            </div>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>MCQ / Coding Split</span>
            <div style={styles.metricValueSplit}>
              <span style={{ color: "#38bdf8" }}>MCQ: {result.mcqScore !== undefined ? result.mcqScore : score}</span>
              {result.codingScore !== undefined && (
                <span style={{ color: "#818cf8" }}> | Coding: {result.codingScore}</span>
              )}
            </div>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Time Taken</span>
            <div style={styles.metricValue}>{formatTime(result.timeTaken)}</div>
          </div>
        </div>

        {/* Integrity & Proctoring Trust Badge */}
        {(() => {
          const tabSwitchesCount = monitoringSummary.tabSwitches || 0;
          const isReviewRequired =
            tabSwitchesCount > 0 ||
            monitoringSummary.flagCount > 0 ||
            (result.monitoringEvents && result.monitoringEvents.length > 0);
          const eventsList = result.monitoringEvents || [];

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
                  <strong>Assessment Integrity Verification</strong>
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

              {/* Timestamped Monitoring Events List */}
              {isReviewRequired && eventsList.length > 0 ? (
                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #1e293b" }}>
                  <span style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: "700", display: "block", marginBottom: "0.4rem" }}>
                    Recorded Integrity Events:
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {eventsList.map((ev, i) => {
                      const timeStr = ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : "N/A";
                      return (
                        <div key={i} style={{ fontSize: "0.82rem", color: "#f87171", display: "flex", gap: "8px" }}>
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
                <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #1e293b", fontSize: "0.85rem", color: "#4ade80" }}>
                  ✓ No monitoring issues detected during assessment.
                </div>
              )}
            </div>
          );
        })()}

        {/* Performance Title Banner */}
        <div style={{ ...styles.banner, borderColor: performanceColor }}>
          <h2 style={{ color: performanceColor, margin: 0, fontSize: "1.3rem" }}>
            {performanceTitle}
          </h2>
        </div>

        {/* Topic-Wise Performance Breakdown */}
        {topicPerformance.length > 0 && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Topic-Wise Performance Breakdown</h3>
            <div style={styles.topicsGrid}>
              {topicPerformance.map((tp, idx) => (
                <div key={idx} style={styles.topicCard}>
                  <div style={styles.topicHeader}>
                    <strong style={{ fontSize: "1rem" }}>{tp.topic}</strong>
                    <span style={{ color: tp.percentage >= 70 ? "#4ade80" : "#fca5a5" }}>
                      {tp.correct} / {tp.total} ({tp.percentage}%)
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${tp.percentage}%`,
                        backgroundColor: tp.percentage >= 70 ? "#22c55e" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Insights & Recommendations */}
        <section style={styles.insightsRow}>
          {strengths.length > 0 && (
            <div style={styles.insightBox}>
              <h4 style={{ color: "#4ade80", margin: "0 0 0.75rem 0" }}>💪 Key Strengths</h4>
              <ul style={styles.list}>
                {strengths.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div style={styles.insightBox}>
              <h4 style={{ color: "#fca5a5", margin: "0 0 0.75rem 0" }}>🎯 Topics to Improve</h4>
              <ul style={styles.list}>
                {weaknesses.map((wk, i) => (
                  <li key={i}>{wk}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {recommendations.length > 0 && (
          <section style={styles.section}>
            <h4 style={{ color: "#38bdf8", margin: "0 0 0.75rem 0" }}>💡 Actionable Recommendations</h4>
            <div style={styles.recommendationBox}>
              {recommendations.map((rec, i) => (
                <p key={i} style={{ margin: "0.4rem 0", fontSize: "0.95rem", lineHeight: "1.5" }}>
                  • {rec}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Full Question Review (MCQ + Coding) */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Detailed Question & Coding Review</h3>

          {result.answers && result.answers.length > 0 ? (
            result.answers.map((ans, idx) => {
              const q = ans.question;
              const isCoding = q?.questionType === "coding" || ans.isCoding;
              const isCorrect = ans.isCorrect;

              return (
                <div
                  key={ans._id || idx}
                  style={{
                    ...styles.reviewCard,
                    borderLeft: `4px solid ${isCorrect ? "#22c55e" : "#ef4444"}`,
                  }}
                >
                  <div style={styles.reviewCardHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={styles.qNumber}>Question {idx + 1}</span>
                      <span style={styles.qTypeBadge}>
                        {isCoding ? "💻 Coding Challenge" : "📝 MCQ"}
                      </span>
                      {q?.topic && <span style={styles.qTopicBadge}>{q.topic}</span>}
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: isCorrect ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: isCorrect ? "#4ade80" : "#fca5a5",
                      }}
                    >
                      {isCorrect ? "✓ Correct / Passed" : "✗ Needs Review"}
                    </span>
                  </div>

                  <p style={styles.reviewQuestionText}>
                    {q?.questionText || "Question text unavailable"}
                  </p>

                  {/* If MCQ question */}
                  {!isCoding && (
                    <div style={styles.reviewDetails}>
                      <p>
                        <strong>Your Selected Answer:</strong>{" "}
                        <span style={{ color: isCorrect ? "#4ade80" : "#fca5a5" }}>
                          {ans.selectedAnswer || "Not Answered"}
                        </span>
                      </p>

                      {!isCorrect && (
                        <p>
                          <strong>Correct Answer:</strong>{" "}
                          <span style={{ color: "#4ade80" }}>
                            {q?.correctAnswer || "Unavailable"}
                          </span>
                        </p>
                      )}

                      {q?.explanation && (
                        <p style={styles.explanationBox}>
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* If Coding Question */}
                  {isCoding && (
                    <div style={styles.reviewDetails}>
                      <div style={styles.codeSnippetHeader}>
                        <span>Language: <strong>{ans.language || "javascript"}</strong></span>
                        {ans.testCasesPassed !== undefined && ans.testCasesTotal !== undefined && (
                          <span style={{ color: isCorrect ? "#4ade80" : "#fca5a5", fontWeight: "700" }}>
                            {ans.testCasesPassed} / {ans.testCasesTotal} Test Cases Passed
                          </span>
                        )}
                      </div>

                      <pre style={styles.codeSnippetPre}>
                        <code>{ans.submittedCode || ans.code || "// No code submitted"}</code>
                      </pre>

                      {q?.explanation && (
                        <p style={styles.explanationBox}>
                          <strong>Solution Approach:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p style={{ color: "#94a3b8" }}>No detailed answer breakdown available.</p>
          )}
        </section>

        {/* Navigation Buttons */}
        <div style={styles.btnRow}>
          <button onClick={() => navigate("/quiz-setup")} style={styles.primaryBtn}>
            Take Another Assessment
          </button>
          <button onClick={() => navigate("/result-history")} style={styles.secondaryBtn}>
            Result History
          </button>
          <button onClick={() => navigate("/dashboard")} style={styles.secondaryBtn}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    color: "#f8fafc",
    padding: "2.5rem 1rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  wrapper: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  headerBadge: {
    fontSize: "0.75rem",
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: "1px",
    marginBottom: "0.4rem",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  metricCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  metricLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "0.4rem",
  },
  metricValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  metricValueSplit: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#f8fafc",
    marginTop: "4px",
  },
  metricSub: {
    fontSize: "1rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  integrityCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
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
    gap: "2rem",
    fontSize: "0.85rem",
    color: "#cbd5e1",
  },
  integrityDim: {
    color: "#64748b",
  },
  banner: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "1.25rem",
    textAlign: "center",
    marginBottom: "2rem",
  },
  section: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.75rem",
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 1.25rem 0",
  },
  topicsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  topicCard: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    padding: "1rem",
  },
  topicHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  progressTrack: {
    height: "8px",
    backgroundColor: "#0f172a",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.4s ease",
  },
  insightsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  insightBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  list: {
    margin: 0,
    paddingLeft: "1.2rem",
    color: "#e2e8f0",
    fontSize: "0.95rem",
  },
  recommendationBox: {
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    color: "#cbd5e1",
  },
  reviewCard: {
    backgroundColor: "#1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
    marginBottom: "1.25rem",
  },
  reviewCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
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
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    color: "#cbd5e1",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
  },
  statusBadge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  reviewQuestionText: {
    fontSize: "1.05rem",
    fontWeight: "600",
    color: "#f8fafc",
    lineHeight: "1.4",
    marginBottom: "1rem",
  },
  reviewDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    fontSize: "0.95rem",
    color: "#cbd5e1",
  },
  codeSnippetHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#94a3b8",
    marginBottom: "0.4rem",
  },
  codeSnippetPre: {
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.85rem",
    color: "#38bdf8",
    fontFamily: "monospace",
    fontSize: "0.88rem",
    overflowX: "auto",
    margin: "0.4rem 0",
  },
  explanationBox: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#0f172a",
    borderRadius: "8px",
    borderLeft: "3px solid #38bdf8",
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  btnRow: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2.5rem",
  },
  primaryBtn: {
    padding: "0.85rem 1.75rem",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "0.85rem 1.75rem",
    borderRadius: "10px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    fontWeight: "600",
    cursor: "pointer",
  },
  loadingContainer: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    color: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    backgroundColor: "#0f172a",
    padding: "2rem",
    borderRadius: "14px",
    textAlign: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #1e293b",
    borderTopColor: "#38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default Result;