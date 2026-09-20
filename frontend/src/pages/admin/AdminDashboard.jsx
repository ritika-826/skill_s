import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats, getUsers, deleteUser } from "../../services/adminService";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ users: 0, quizzes: 0, results: 0, materials: 0 });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([getAdminStats(), getUsers()]);
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (usersRes && Array.isArray(usersRes.users)) {
        setUsersList(usersRes.users);
      }
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);
      setError("Failed to load admin telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      setStats((prev) => ({ ...prev, users: Math.max(0, prev.users - 1) }));
      setActionMessage(`User "${userName}" successfully removed.`);
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.targetRole || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" || (user.role || "student").toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <h3 style={{ color: "#ef4444", marginTop: "1rem" }}>Loading Admin Workspace...</h3>
        <p style={{ color: "#94a3b8" }}>Fetching platform telemetry and user database.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>ADMINISTRATOR CONTROL PANEL</div>
            <h1 style={styles.title}>System Overview & User Management</h1>
            <p style={styles.subTitle}>
              Real-time platform metrics, user access controls, assessment logs, and database administration.
            </p>
          </div>

          <div style={styles.quickNavBtns}>
            <button onClick={() => navigate("/admin/question-bank")} style={styles.actionBtnSecondary}>
              📚 Question Bank
            </button>
            <button onClick={() => navigate("/admin/upload-material")} style={styles.actionBtnPrimary}>
              📁 Upload Material
            </button>
          </div>
        </header>

        {actionMessage && (
          <div style={styles.successBanner}>
            ✓ {actionMessage}
          </div>
        )}

        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {/* Stats Metrics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Registered Users</span>
              <span style={{ fontSize: "1.4rem" }}>👥</span>
            </div>
            <div style={styles.statValue}>{stats.users || usersList.length || 0}</div>
            <div style={styles.statSub}>Active platform candidates & recruiters</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Total Quizzes</span>
              <span style={{ fontSize: "1.4rem" }}>📝</span>
            </div>
            <div style={{ ...styles.statValue, color: "#38bdf8" }}>{stats.quizzes || 0}</div>
            <div style={styles.statSub}>Generated assessment sessions</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Completed Submissions</span>
              <span style={{ fontSize: "1.4rem" }}>🏆</span>
            </div>
            <div style={{ ...styles.statValue, color: "#22c55e" }}>{stats.results || 0}</div>
            <div style={styles.statSub}>Evaluated assessment reports</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Learning Resources</span>
              <span style={{ fontSize: "1.4rem" }}>📚</span>
            </div>
            <div style={{ ...styles.statValue, color: "#a855f7" }}>{stats.materials || 0}</div>
            <div style={styles.statSub}>Uploaded preparation guides</div>
          </div>
        </div>

        {/* User Management Section */}
        <section style={styles.section}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h2 style={styles.sectionTitle}>User Directory</h2>
              <p style={{ color: "#94a3b8", margin: "2px 0 0 0", fontSize: "0.85rem" }}>
                Inspect registered users, manage roles, and enforce security policies.
              </p>
            </div>

            {/* Filters */}
            <div style={styles.filterRow}>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="all">All Roles</option>
                <option value="student">Student / Candidate</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Platform Role</th>
                  <th style={styles.th}>Target Skill / Focus</th>
                  <th style={styles.th}>Joined Date</th>
                  <th style={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} style={styles.tr}>
                      <td style={styles.tdBold}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor:
                                u.role === "admin"
                                  ? "#ef4444"
                                  : u.role === "recruiter"
                                  ? "#6366f1"
                                  : "#0284c7",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.85rem",
                            }}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span>{u.name || "Unnamed User"}</span>
                        </div>
                      </td>
                      <td style={styles.tdDim}>{u.email}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.roleTag,
                            backgroundColor:
                              u.role === "admin"
                                ? "rgba(239, 68, 68, 0.15)"
                                : u.role === "recruiter"
                                ? "rgba(99, 102, 241, 0.15)"
                                : "rgba(56, 189, 248, 0.15)",
                            color:
                              u.role === "admin"
                                ? "#f87171"
                                : u.role === "recruiter"
                                ? "#818cf8"
                                : "#38bdf8",
                          }}
                        >
                          {(u.role || "Student").toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.tdDim}>{u.targetRole || "General"}</td>
                      <td style={styles.tdDim}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={styles.tdRight}>
                        {u.role !== "admin" ? (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name || u.email)}
                            style={styles.deleteBtn}
                          >
                            🗑 Delete
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Protected</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={styles.emptyTd}>
                      No users match the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
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
    gap: "2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "1rem",
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
    color: "#f8fafc",
  },
  subTitle: {
    color: "#94a3b8",
    margin: "0.4rem 0 0 0",
    fontSize: "0.95rem",
  },
  quickNavBtns: {
    display: "flex",
    gap: "0.75rem",
  },
  actionBtnPrimary: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "0.65rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  actionBtnSecondary: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "0.65rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.88rem",
    cursor: "pointer",
  },
  successBanner: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid #22c55e",
    color: "#4ade80",
    padding: "0.85rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#f87171",
    padding: "0.85rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.25rem",
  },
  statCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: "600",
  },
  statValue: {
    fontSize: "2.2rem",
    fontWeight: "800",
    color: "#f8fafc",
    lineHeight: "1",
  },
  statSub: {
    fontSize: "0.78rem",
    color: "#64748b",
  },
  section: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  sectionHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    margin: 0,
    color: "#f8fafc",
  },
  filterRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontSize: "0.88rem",
    minWidth: "260px",
    outline: "none",
  },
  selectFilter: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    fontSize: "0.88rem",
    outline: "none",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
  thRow: {
    borderBottom: "1px solid #1e293b",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    color: "#64748b",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  thRight: {
    textAlign: "right",
    padding: "0.75rem 1rem",
    color: "#64748b",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  tr: {
    borderBottom: "1px solid #1e293b",
  },
  tdBold: {
    padding: "0.85rem 1rem",
    fontWeight: "600",
    color: "#f8fafc",
  },
  td: {
    padding: "0.85rem 1rem",
    color: "#e2e8f0",
  },
  tdDim: {
    padding: "0.85rem 1rem",
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
  tdRight: {
    padding: "0.85rem 1rem",
    textAlign: "right",
  },
  roleTag: {
    padding: "0.2rem 0.55rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  deleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  emptyTd: {
    textAlign: "center",
    padding: "2rem",
    color: "#64748b",
    fontStyle: "italic",
  },
  loadingWrapper: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
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

export default AdminDashboard;
