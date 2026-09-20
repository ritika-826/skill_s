import { useEffect, useState } from "react";
import { getMaterials, uploadMaterial, deleteMaterial } from "../../services/adminService";

function UploadMaterial() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("Backend Developer");
  const [topic, setTopic] = useState("REST APIs");
  const [type, setType] = useState("pdf"); // "pdf" | "link" | "doc"
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMaterialsList();
  }, []);

  const fetchMaterialsList = async () => {
    try {
      setLoading(true);
      const data = await getMaterials();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH MATERIALS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Please fill in both title and URL");
      return;
    }

    try {
      setIsSubmitting(true);
      const newMaterial = await uploadMaterial({
        title,
        role,
        topic,
        type,
        url,
        description,
      });

      setMaterials((prev) => [newMaterial.material || newMaterial, ...prev]);
      setTitle("");
      setUrl("");
      setDescription("");
      setMessage("Learning material uploaded successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("UPLOAD MATERIAL ERROR:", err);
      alert("Failed to upload material: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, mTitle) => {
    if (!window.confirm(`Delete material "${mTitle}"?`)) return;
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("DELETE MATERIAL ERROR:", err);
      alert("Failed to delete material.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>RESOURCE MANAGEMENT</div>
            <h1 style={styles.title}>Learning & Preparation Materials</h1>
            <p style={styles.subTitle}>
              Upload study guides, PDF document links, and preparation references for candidates.
            </p>
          </div>
        </header>

        {message && <div style={styles.successBanner}>✓ {message}</div>}

        <div style={styles.contentGrid}>
          {/* Left: Upload Form */}
          <section style={styles.formCard}>
            <h2 style={styles.formTitle}>Upload New Resource</h2>

            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Class REST API Guide 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.rowTwo}>
                <div style={styles.field}>
                  <label style={styles.label}>Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={styles.select}
                  >
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Resource Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={styles.select}
                  >
                    <option value="pdf">📄 PDF Document</option>
                    <option value="link">🔗 Web Reference</option>
                    <option value="doc">📝 Study Note</option>
                  </select>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Topic / Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Docker, System Design, REST APIs"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Resource URL / Link *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/materials/guide.pdf"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description & Key Topics</label>
                <textarea
                  rows="3"
                  placeholder="Brief description of what candidates will learn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
                {isSubmitting ? "Uploading..." : "🚀 Publish Material"}
              </button>
            </form>
          </section>

          {/* Right: Existing Materials List */}
          <section style={styles.listSection}>
            <h2 style={styles.formTitle}>Published Materials ({materials.length})</h2>

            <div style={styles.materialsList}>
              {loading ? (
                <p style={{ color: "#94a3b8" }}>Loading materials...</p>
              ) : materials.length > 0 ? (
                materials.map((m) => (
                  <div key={m._id} style={styles.materialCard}>
                    <div style={styles.mHeader}>
                      <div>
                        <span style={styles.mRole}>{m.role || "General"}</span>
                        <h4 style={styles.mTitle}>{m.title}</h4>
                      </div>
                      <button onClick={() => handleDelete(m._id, m.title)} style={styles.deleteIconBtn}>
                        🗑
                      </button>
                    </div>

                    {m.description && <p style={styles.mDesc}>{m.description}</p>}

                    <div style={styles.mFooter}>
                      <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                        Topic: {m.topic || "Skill"}
                      </span>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.viewLink}
                      >
                        Open Resource ↗
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyCard}>
                  <p style={{ color: "#94a3b8", margin: 0 }}>No learning materials uploaded yet.</p>
                </div>
              )}
            </div>
          </section>
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
    maxWidth: "1300px",
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
  successBanner: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    border: "1px solid #22c55e",
    color: "#4ade80",
    padding: "0.85rem 1.25rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },
  formCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "1.5rem",
  },
  formTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    margin: "0 0 1.25rem 0",
    color: "#f8fafc",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  rowTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  label: {
    fontSize: "0.85rem",
    color: "#cbd5e1",
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.65rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  select: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.65rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
  },
  textarea: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.65rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
  },
  submitBtn: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "0.95rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  listSection: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "1.5rem",
  },
  materialsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  materialCard: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },
  mHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mRole: {
    fontSize: "0.72rem",
    fontWeight: "700",
    color: "#f87171",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: "0.15rem 0.4rem",
    borderRadius: "4px",
    display: "inline-block",
    marginBottom: "4px",
  },
  mTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  deleteIconBtn: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.2rem",
  },
  mDesc: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    margin: 0,
    lineHeight: "1.4",
  },
  mFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "0.4rem",
    borderTop: "1px solid #334155",
    paddingTop: "0.5rem",
  },
  viewLink: {
    color: "#38bdf8",
    fontSize: "0.85rem",
    fontWeight: "600",
    textDecoration: "none",
  },
  emptyCard: {
    backgroundColor: "#1e293b",
    padding: "2rem",
    borderRadius: "10px",
    textAlign: "center",
  },
};

export default UploadMaterial;
