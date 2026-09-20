import { useEffect, useState } from "react";
import { getQuestionBank } from "../../services/adminService";

function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "mcq" | "coding"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await getQuestionBank();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH QUESTIONS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesType = typeFilter === "all" || q.questionType === typeFilter;
    const qText = q.questionText || q.problemStatement || q.title || "";
    const matchesSearch =
      qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.role || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <h3 style={{ color: "#ef4444", marginTop: "1rem" }}>Loading Question Repository...</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>ADMINISTRATION</div>
            <h1 style={styles.title}>Global Question Repository</h1>
            <p style={styles.subTitle}>
              Inspect and verify MCQ items, coding challenges, starter codes, and automated test suites.
            </p>
          </div>
        </header>

        {/* Filter Toolbar */}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search questions by topic, text, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.typeToggle}>
            <button
              onClick={() => setTypeFilter("all")}
              style={{
                ...styles.toggleBtn,
                ...(typeFilter === "all" ? styles.toggleBtnActive : {}),
              }}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setTypeFilter("mcq")}
              style={{
                ...styles.toggleBtn,
                ...(typeFilter === "mcq" ? styles.toggleBtnActive : {}),
              }}
            >
              📝 MCQs ({questions.filter((q) => q.questionType === "mcq").length})
            </button>
            <button
              onClick={() => setTypeFilter("coding")}
              style={{
                ...styles.toggleBtn,
                ...(typeFilter === "coding" ? styles.toggleBtnActive : {}),
              }}
            >
              💻 Coding ({questions.filter((q) => q.questionType === "coding").length})
            </button>
          </div>
        </div>

        {/* Question Cards Grid */}
        <div style={styles.grid}>
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((q, idx) => (
              <div key={q._id || idx} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span
                      style={{
                        ...styles.typeBadge,
                        backgroundColor:
                          q.questionType === "coding"
                            ? "rgba(99, 102, 241, 0.15)"
                            : "rgba(56, 189, 248, 0.15)",
                        color: q.questionType === "coding" ? "#818cf8" : "#38bdf8",
                      }}
                    >
                      {q.questionType === "coding" ? "💻 CODING" : "📝 MCQ"}
                    </span>
                    <span style={styles.topicTag}>Topic: {q.topic || "General"}</span>
                  </div>

                  <span
                    style={{
                      ...styles.diffBadge,
                      backgroundColor:
                        q.difficulty === "easy"
                          ? "rgba(34, 197, 94, 0.15)"
                          : q.difficulty === "hard"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(234, 179, 8, 0.15)",
                      color:
                        q.difficulty === "easy"
                          ? "#4ade80"
                          : q.difficulty === "hard"
                          ? "#f87171"
                          : "#facc15",
                    }}
                  >
                    {(q.difficulty || "medium").toUpperCase()}
                  </span>
                </div>

                <h3 style={styles.questionTitle}>
                  {q.questionType === "coding"
                    ? q.title || "Coding Challenge"
                    : q.questionText || "Multiple Choice Question"}
                </h3>

                {q.questionType === "coding" && (
                  <p style={styles.problemSnippet}>
                    {q.problemStatement || q.questionText}
                  </p>
                )}

                {/* MCQ Options list */}
                {q.questionType !== "coding" && Array.isArray(q.options) && (
                  <div style={styles.optionsList}>
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          ...styles.optionItem,
                          ...(opt === q.correctAnswer ? styles.correctOption : {}),
                        }}
                      >
                        <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                        {opt === q.correctAnswer && (
                          <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "0.8rem" }}>
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Coding Details preview */}
                {q.questionType === "coding" && (
                  <div style={styles.codingMetaBox}>
                    {q.constraints && (
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        <strong>Constraints:</strong> {q.constraints}
                      </div>
                    )}
                    {Array.isArray(q.testCases) && (
                      <div style={{ fontSize: "0.8rem", color: "#38bdf8", marginTop: "4px" }}>
                        ⚡ {q.testCases.length} Test Cases configured ({q.testCases.filter(t => !t.isHidden).length} Public, {q.testCases.filter(t => t.isHidden).length} Hidden)
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</div>
              <h3>No Questions Found</h3>
              <p style={{ color: "#94a3b8" }}>Try adjusting your search query or filter settings.</p>
            </div>
          )}
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
    padding: "2rem 1.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  wrapper: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "0.2rem 0.6rem",
    borderRadius: "12px",
    fontSize: "0.72rem",
    fontWeight: "800",
    display: "inline-block",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    margin: 0,
  },
  subTitle: {
    color: "#94a3b8",
    margin: "0.4rem 0 0 0",
    fontSize: "0.95rem",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    backgroundColor: "#0f172a",
    padding: "1rem",
    borderRadius: "12px",
    border: "1px solid #1e293b",
  },
  searchInput: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    minWidth: "300px",
    outline: "none",
  },
  typeToggle: {
    display: "flex",
    gap: "0.5rem",
  },
  toggleBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#94a3b8",
    padding: "0.55rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  toggleBtnActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
    color: "#ffffff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "1.25rem",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    fontSize: "0.72rem",
    fontWeight: "800",
    padding: "0.15rem 0.5rem",
    borderRadius: "6px",
  },
  topicTag: {
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  diffBadge: {
    fontSize: "0.72rem",
    fontWeight: "700",
    padding: "0.15rem 0.5rem",
    borderRadius: "6px",
  },
  questionTitle: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
    lineHeight: "1.4",
  },
  problemSnippet: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
    lineHeight: "1.5",
    margin: 0,
    backgroundColor: "#090d16",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #1e293b",
    whiteSpace: "pre-wrap",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  optionItem: {
    backgroundColor: "#1e293b",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    color: "#e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  correctOption: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid #22c55e",
  },
  codingMetaBox: {
    backgroundColor: "#090d16",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #1e293b",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "4rem 2rem",
    backgroundColor: "#0f172a",
    borderRadius: "16px",
    border: "1px solid #1e293b",
  },
  loadingWrapper: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #1e293b",
    borderTopColor: "#ef4444",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default QuestionBank;
