import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyResults } from "../services/resultService";
import StatCard from "../components/StatCard";

function ResultHistory() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyResults();
      console.log("RESULT HISTORY LOADED:", data);
      setResults(data.results || []);
    } catch (err) {
      console.error("RESULT HISTORY ERROR:", err);
      setError(err.response?.data?.message || "Unable to load assessment history");
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const totalCount = results.length;
  const avgScore = totalCount > 0 ? Math.round(results.reduce((a, b) => a + (b.percentage || 0), 0) / totalCount) : 0;
  const bestScore = totalCount > 0 ? Math.max(...results.map((r) => r.percentage || 0)) : 0;
  const skillsImproved = new Set(results.map((r) => r.role || r.quiz?.role || r.quiz?.topic)).size;

  // Filter & Sort Logic
  const filteredResults = results
    .filter((res) => {
      const rRole = (res.role || res.quiz?.role || res.quiz?.topic || "").toLowerCase();
      const matchSearch = rRole.includes(searchQuery.toLowerCase());
      const matchRole = selectedRoleFilter === "all" || rRole === selectedRoleFilter.toLowerCase();
      const matchDiff =
        selectedDifficultyFilter === "all" ||
        (res.quiz?.difficulty || "mixed").toLowerCase() === selectedDifficultyFilter.toLowerCase();
      return matchSearch && matchRole && matchDiff;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "highest") return (b.percentage || 0) - (a.percentage || 0);
      if (sortBy === "lowest") return (a.percentage || 0) - (b.percentage || 0);
      return 0;
    });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Assessment History</h1>
            <p style={styles.subtitle}>
              Track your score history, time metrics, and topic analytics across all taken assessments.
            </p>
          </div>
          <button onClick={() => navigate("/quiz-setup")} style={styles.newQuizBtn}>
            + Take New Assessment
          </button>
        </div>

        {/* Top Summary Cards */}
        <div style={styles.statsGrid}>
          <StatCard title="Total Completed" value={totalCount} subtext="Evaluated assessments" icon="📋" />
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            subtext="Overall accuracy"
            icon="📊"
            accentColor={avgScore >= 70 ? "#22c55e" : "#38bdf8"}
          />
          <StatCard title="Best Score" value={`${bestScore}%`} subtext="Personal record" icon="🏆" accentColor="#818cf8" />
          <StatCard title="Skills Evaluated" value={skillsImproved} subtext="Unique skill tracks" icon="🧠" />
        </div>

        {/* Filters & Search Toolbar */}
        <div style={styles.filterCard}>
          <div style={styles.filterRow}>
            {/* Search Input */}
            <div style={{ flex: 2, minWidth: "220px" }}>
              <input
                type="text"
                placeholder="Search by role or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Role Filter Dropdown */}
            <div style={{ flex: 1, minWidth: "150px" }}>
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Roles</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Machine Learning Engineer">ML Engineer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div style={{ flex: 1, minWidth: "140px" }}>
              <select
                value={selectedDifficultyFilter}
                onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ flex: 1, minWidth: "140px" }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Data View */}
        {loading && <p style={{ color: "#94a3b8" }}>Loading assessment history...</p>}
        {error && <p style={{ color: "#ef4444" }}>{error}</p>}

        {!loading && !error && filteredResults.length === 0 && (
          <div style={styles.emptyState}>
            <h3>No Assessment Results Found</h3>
            <p style={{ color: "#94a3b8", margin: "0.5rem 0 1.5rem 0" }}>
              No past assessment history matches your filter criteria.
            </p>
            <button onClick={() => navigate("/quiz-setup")} style={styles.newQuizBtn}>
              Start Your First Assessment
            </button>
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div style={styles.resultsGrid}>
            {filteredResults.map((r) => {
              const roleTitle = r.role || r.quiz?.role || r.quiz?.topic || "Technical Assessment";
              const dateStr = new Date(r.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const mins = Math.floor((r.timeTaken || 0) / 60);
              const secs = (r.timeTaken || 0) % 60;

              return (
                <div key={r._id} style={styles.historyCard}>
                  <div style={styles.historyCardHeader}>
                    <div>
                      <h3 style={styles.historyRole}>{roleTitle}</h3>
                      <span style={styles.historyDate}>{dateStr}</span>
                    </div>
                    <div style={styles.historyScoreBox}>
                      <span
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: "800",
                          color: r.percentage >= 70 ? "#4ade80" : "#fca5a5",
                        }}
                      >
                        {r.percentage}%
                      </span>
                    </div>
                  </div>

                  <div style={styles.metaPillsRow}>
                    <span style={styles.metaPill}>
                      Score: <strong>{r.score} / {r.totalQuestions}</strong>
                    </span>
                    <span style={styles.metaPill}>
                      Time: <strong>{mins}m {secs}s</strong>
                    </span>
                    <span style={styles.metaPill}>
                      Status: <strong style={{ color: "#4ade80" }}>Completed</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/result/${r._id}`)}
                    style={styles.viewReportBtn}
                  >
                    View Report & Explanation →
                  </button>
                </div>
              );
            })}
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
    maxWidth: "1280px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "1.75rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
  newQuizBtn: {
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
  },
  filterCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.25rem",
  },
  filterRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
  },
  filterSelect: {
    width: "100%",
    padding: "0.75rem 1rem",
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "pointer",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "1.25rem",
  },
  historyCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
  },
  historyCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyRole: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 2px 0",
  },
  historyDate: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  historyScoreBox: {
    backgroundColor: "#1e293b",
    padding: "0.35rem 0.85rem",
    borderRadius: "8px",
  },
  metaPillsRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  metaPill: {
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    fontSize: "0.8rem",
    padding: "0.3rem 0.65rem",
    borderRadius: "6px",
  },
  viewReportBtn: {
    marginTop: "auto",
    backgroundColor: "transparent",
    border: "1px solid #334155",
    color: "#38bdf8",
    padding: "0.7rem",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#0f172a",
    border: "1px dashed #334155",
    borderRadius: "16px",
    padding: "3rem",
    textAlign: "center",
  },
};

export default ResultHistory;