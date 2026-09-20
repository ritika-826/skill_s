function RecruiterStatCard({
  title,
  value,
  subtext,
  icon,
  badgeText,
  badgeType = "positive",
  accentColor = "#38bdf8",
}) {
  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <span style={styles.title}>{title}</span>
        <div
          style={{
            ...styles.iconWrapper,
            backgroundColor: `${accentColor}18`,
            borderColor: `${accentColor}33`,
          }}
        >
          <span style={{ ...styles.icon, color: accentColor }}>{icon}</span>
        </div>
      </div>

      <div style={styles.valueRow}>
        <span style={styles.value}>{value}</span>
        {badgeText && (
          <span
            style={{
              ...styles.badge,
              backgroundColor: badgeType === "positive" ? "rgba(34, 197, 94, 0.15)" : "rgba(129, 140, 248, 0.15)",
              color: badgeType === "positive" ? "#4ade80" : "#818cf8",
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {subtext && <p style={styles.subtext}>{subtext}</p>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.4rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    transition: "transform 0.2s ease, border-color 0.2s ease",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  iconWrapper: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: "1.1rem",
  },
  valueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.75rem",
    marginTop: "0.25rem",
  },
  value: {
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: "-0.5px",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "0.15rem 0.5rem",
    borderRadius: "6px",
  },
  subtext: {
    margin: 0,
    fontSize: "0.82rem",
    color: "#64748b",
  },
};

export default RecruiterStatCard;
