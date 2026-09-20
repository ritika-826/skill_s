export function RecruiterEmptyState({
  title = "No assessment data available yet",
  description = "Candidates will appear here once they complete their role-specific technical evaluations.",
  icon = "📋",
  actionText,
  onAction,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.iconCircle}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} style={styles.actionBtn}>
          {actionText}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0f172a",
    border: "1px dashed #334155",
    borderRadius: "14px",
    padding: "3.5rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    width: "100%",
  },
  iconCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
    border: "1px solid rgba(56, 189, 248, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    marginBottom: "0.5rem",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#f8fafc",
  },
  description: {
    margin: 0,
    fontSize: "0.92rem",
    color: "#94a3b8",
    maxWidth: "460px",
    lineHeight: "1.5",
  },
  actionBtn: {
    marginTop: "0.75rem",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    border: "none",
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
};

export default RecruiterEmptyState;
