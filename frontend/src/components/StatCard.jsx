function StatCard({ title, value, subtext, icon, accentColor = "#38bdf8" }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${accentColor}` }}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        {icon && <span style={styles.icon}>{icon}</span>}
      </div>
      <div style={{ ...styles.value, color: accentColor }}>{value}</div>
      {subtext && <p style={styles.subtext}>{subtext}</p>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  icon: {
    fontSize: "1.2rem",
  },
  value: {
    fontSize: "1.75rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    marginTop: "0.2rem",
  },
  subtext: {
    fontSize: "0.8rem",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
};

export default StatCard;
