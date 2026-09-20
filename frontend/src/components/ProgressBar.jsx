function ProgressBar({ value = 0, max = 100, label = "", showPercentage = true }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let color = "#ef4444"; // Red for low
  if (percentage >= 80) color = "#22c55e"; // Green for high
  else if (percentage >= 60) color = "#38bdf8"; // Cyan for medium-high
  else if (percentage >= 40) color = "#eab308"; // Amber for medium

  return (
    <div style={styles.wrapper}>
      {(label || showPercentage) && (
        <div style={styles.labelRow}>
          {label && <span style={styles.label}>{label}</span>}
          {showPercentage && <span style={{ ...styles.percentage, color }}>{percentage}%</span>}
        </div>
      )}
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.4rem",
    fontSize: "0.85rem",
  },
  label: {
    color: "#cbd5e1",
    fontWeight: "600",
  },
  percentage: {
    fontWeight: "700",
    fontFamily: "monospace",
  },
  track: {
    height: "8px",
    backgroundColor: "#0f172a",
    borderRadius: "4px",
    overflow: "hidden",
    border: "1px solid #1e293b",
  },
  fill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

export default ProgressBar;
