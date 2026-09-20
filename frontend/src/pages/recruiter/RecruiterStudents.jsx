import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecruiterStudents } from "../../services/recruiterService";
import RecruiterLoadingSkeleton from "../../components/recruiter/RecruiterLoadingSkeleton";
import RecruiterEmptyState from "../../components/recruiter/RecruiterEmptyState";

function RecruiterStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and search states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("highestScore");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        search: search.trim(),
        role: roleFilter !== "All" ? roleFilter : undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        sortBy,
        sortOrder,
      };

      const data = await getRecruiterStudents(params);
      setStudents(data.students || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error("LOAD STUDENTS ERROR:", err);
      setError(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  // Debounce search / filter triggers
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, sortBy, sortOrder]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>TALENT DIRECTORY</div>
            <h1 style={styles.title}>Candidate Management</h1>
            <p style={styles.subtitle}>
              Search, filter, and inspect student performance across engineering tracks.
            </p>
          </div>

          <div style={styles.totalPill}>
            Total Candidates: <strong style={{ color: "#38bdf8" }}>{pagination.total}</strong>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={styles.filterCard}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by student name or email..."
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
            {/* Role Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Target Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Roles</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="Site Reliability Engineer (SRE)">Site Reliability Engineer (SRE)</option>
                <option value="Infrastructure Engineer">Infrastructure Engineer</option>
                <option value="Security Engineer / DevSecOps">Security Engineer / DevSecOps</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="QA Automation Engineer">QA Automation Engineer</option>
                <option value="Software Engineer in Test (SDET)">Software Engineer in Test (SDET)</option>
                <option value="Mobile App Developer (React Native/Flutter)">Mobile App Developer</option>
                <option value="iOS Developer">iOS Developer</option>
                <option value="Android Developer">Android Developer</option>
                <option value="Database Administrator (DBA)">Database Administrator (DBA)</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Network Engineer">Network Engineer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="Solutions Architect">Solutions Architect</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Candidate Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active (Has Completed Tests)</option>
                <option value="top">Top Performer (≥80% Avg)</option>
                <option value="inactive">Registered Only</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.select}
              >
                <option value="highestScore">Highest Score</option>
                <option value="lowestScore">Lowest Score</option>
                <option value="mostAssessments">Most Assessments</option>
                <option value="recentAssessment">Recent Assessment</option>
                <option value="name">Candidate Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table / Content Area */}
        <div style={styles.tableCard}>
          {loading && <RecruiterLoadingSkeleton count={5} type="table" />}

          {error && (
            <div style={styles.errorBanner}>
              <p>⚠️ {error}</p>
              <button onClick={() => fetchStudents(pagination.page)} style={styles.retryBtn}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && students.length === 0 && (
            <RecruiterEmptyState
              title="No candidates matched your search"
              description="Try adjusting your keywords, role filters, or score sorting criteria."
              actionText="Reset Filters"
              onAction={() => {
                setSearch("");
                setRoleFilter("All");
                setStatusFilter("All");
                setSortBy("highestScore");
              }}
            />
          )}

          {!loading && !error && students.length > 0 && (
            <>
              <div style={styles.tableResponsive}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>Target Role</th>
                      <th style={styles.th}>Assessments</th>
                      <th style={styles.th}>Avg Score</th>
                      <th style={styles.th}>Best Score</th>
                      <th style={styles.th}>Last Active</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.thRight}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} style={styles.tr}>
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
                            {student.assessmentsCompleted}
                          </strong>{" "}
                          <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                            / {student.assessmentsTaken} tests
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              fontWeight: "700",
                              color:
                                student.averageScore >= 80
                                  ? "#4ade80"
                                  : student.averageScore >= 60
                                  ? "#38bdf8"
                                  : "#fca5a5",
                            }}
                          >
                            {student.averageScore > 0 ? `${student.averageScore}%` : "—"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: "700", color: "#f8fafc" }}>
                            {student.bestScore > 0 ? `${student.bestScore}%` : "—"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.dateText}>{student.lastAssessment}</span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: student.badgeBg,
                              color: student.badgeColor,
                            }}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td style={styles.tdRight}>
                          <button
                            onClick={() => navigate(`/recruiter/students/${student.id}`)}
                            style={styles.viewPerfBtn}
                          >
                            View Performance →
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
                    <strong>{pagination.totalPages}</strong> ({pagination.total} total candidates)
                  </div>
                  <div style={styles.paginationBtns}>
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => fetchStudents(pagination.page - 1)}
                      style={{
                        ...styles.pageBtn,
                        opacity: pagination.page <= 1 ? 0.4 : 1,
                        cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: pagination.totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = pageNum === pagination.page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchStudents(pageNum)}
                          style={{
                            ...styles.pageNumBtn,
                            ...(isCurrent ? styles.pageNumCurrent : {}),
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchStudents(pagination.page + 1)}
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
    letterSpacing: "0.5px",
    borderBottom: "1px solid #1e293b",
    whiteSpace: "nowrap",
  },
  thRight: {
    padding: "0.85rem 1rem",
    fontSize: "0.78rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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
  studentNameBlock: {
    display: "flex",
    flexDirection: "column",
  },
  studentName: {
    fontWeight: "700",
    color: "#f8fafc",
  },
  studentEmail: {
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
    whiteSpace: "nowrap",
  },
  statusBadge: {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },
  dateText: {
    color: "#94a3b8",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },
  viewPerfBtn: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    color: "#38bdf8",
    padding: "0.45rem 0.9rem",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
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

export default RecruiterStudents;
