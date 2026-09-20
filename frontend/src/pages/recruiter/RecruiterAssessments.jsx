import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecruiterAssessments } from "../../services/recruiterService";
import AssessmentDetailModal from "../../components/recruiter/AssessmentDetailModal";
import RecruiterLoadingSkeleton from "../../components/recruiter/RecruiterLoadingSkeleton";
import RecruiterEmptyState from "../../components/recruiter/RecruiterEmptyState";

function RecruiterAssessments() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const fetchAssessments = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 12,
        search: search.trim(),
        role: roleFilter !== "All" ? roleFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
      };

      const data = await getRecruiterAssessments(params);
      setAssessments(data.assessments || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("LOAD ASSESSMENTS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load candidate assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssessments(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>ASSESSMENT ACTIVITY MONITOR</div>
            <h1 style={styles.title}>All Candidate Assessments</h1>
            <p style={styles.subtitle}>
              Monitor active and completed evaluation sessions across all technical tracks.
            </p>
          </div>

          <div style={styles.totalPill}>
            Total Submissions: <strong style={{ color: "#38bdf8" }}>{pagination.total}</strong>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={styles.filterCard}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by candidate name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={styles.clearBtn}>
                ✕
              </button>
            )}
          </div>

          <div style={styles.dropdownsRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Target Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Roles</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div style={styles.tableCard}>
          {loading && <RecruiterLoadingSkeleton count={5} type="table" />}

          {error && (
            <div style={styles.errorBanner}>
              <p>⚠️ {error}</p>
              <button onClick={() => fetchAssessments(pagination.page)} style={styles.retryBtn}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && assessments.length === 0 && (
            <RecruiterEmptyState
              title="No assessment records found"
              description="Candidate evaluation submissions matching your filter criteria will appear here."
              actionText="Reset Filters"
              onAction={() => {
                setSearch("");
                setRoleFilter("All");
                setStatusFilter("All");
              }}
            />
          )}

          {!loading && !error && assessments.length > 0 && (
            <>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Candidate</th>
                      <th style={styles.th}>Target Role</th>
                      <th style={styles.th}>Assessment</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Questions</th>
                      <th style={styles.th}>Duration</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Completed</th>
                      <th style={styles.thRight}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((item) => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.candidateBlock}>
                            <span style={styles.candidateName}>{item.studentName}</span>
                            <span style={styles.candidateEmail}>{item.email}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.rolePill}>{item.targetRole}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: "#f8fafc", fontWeight: "600" }}>
                            {item.assessmentName}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.scoreHighlight}>{item.score}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: "#cbd5e1" }}>{item.scoreCount}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: "#94a3b8" }}>{item.timeTaken}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.completedBadge}>✓ {item.status}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>
                            {item.date}
                          </span>
                        </td>
                        <td style={styles.tdRight}>
                          <button
                            onClick={() => setSelectedAssessmentId(item.id)}
                            style={styles.inspectBtn}
                          >
                            Inspect Test →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div style={styles.paginationRow}>
                  <div style={styles.paginationInfo}>
                    Showing Page <strong>{pagination.page}</strong> of{" "}
                    <strong>{pagination.totalPages}</strong> ({pagination.total} tests)
                  </div>
                  <div style={styles.paginationBtns}>
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => fetchAssessments(pagination.page - 1)}
                      style={{
                        ...styles.pageBtn,
                        opacity: pagination.page <= 1 ? 0.4 : 1,
                        cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => fetchAssessments(p)}
                          style={{
                            ...styles.pageNumBtn,
                            ...(p === pagination.page ? styles.pageNumCurrent : {}),
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchAssessments(pagination.page + 1)}
                      style={{
                        ...styles.pageBtn,
                        opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                        cursor: pagination.page >= pagination.totalPages ? "not-allowed" : "pointer",
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drill-Down Modal */}
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
    gap: "1rem",
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
  totalPill: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    padding: "0.5rem 1rem",
    borderRadius: "10px",
    fontSize: "0.9rem",
    color: "#94a3b8",
  },
  filterCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "0.95rem",
    color: "#64748b",
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.75rem 2.5rem 0.75rem 2.5rem",
    color: "#f8fafc",
    fontSize: "0.95rem",
    outline: "none",
  },
  clearBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  dropdownsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  filterLabel: {
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  select: {
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "0.65rem 0.85rem",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "pointer",
  },
  tableCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
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
  candidateBlock: {
    display: "flex",
    flexDirection: "column",
  },
  candidateName: {
    fontWeight: "700",
    color: "#f8fafc",
  },
  candidateEmail: {
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  rolePill: {
    display: "inline-block",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    color: "#38bdf8",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    padding: "0.2rem 0.6rem",
    borderRadius: "12px",
    fontSize: "0.78rem",
    fontWeight: "600",
  },
  scoreHighlight: {
    fontWeight: "800",
    color: "#4ade80",
    fontSize: "1rem",
  },
  completedBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    color: "#4ade80",
    border: "1px solid rgba(34, 197, 94, 0.25)",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
  },
  inspectBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    color: "#38bdf8",
    padding: "0.45rem 0.9rem",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  paginationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  paginationInfo: {
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  paginationBtns: {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
  },
  pageBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: "600",
  },
  pageNumBtn: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    color: "#94a3b8",
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  pageNumCurrent: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "700",
  },
  errorBanner: {
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

export default RecruiterAssessments;
