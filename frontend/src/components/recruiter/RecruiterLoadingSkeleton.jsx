export function RecruiterLoadingSkeleton({ count = 4, type = "card" }) {
  if (type === "table") {
    return (
      <div style={styles.tableSkeleton}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={styles.tableRow}>
            <div style={{ ...styles.block, width: "30%", height: "20px" }} />
            <div style={{ ...styles.block, width: "25%", height: "20px" }} />
            <div style={{ ...styles.block, width: "15%", height: "20px" }} />
            <div style={{ ...styles.block, width: "15%", height: "20px" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={styles.card}>
          <div style={{ ...styles.block, width: "40%", height: "14px" }} />
          <div style={{ ...styles.block, width: "70%", height: "32px", marginTop: "8px" }} />
          <div style={{ ...styles.block, width: "50%", height: "12px", marginTop: "6px" }} />
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1.25rem",
    width: "100%",
  },
  card: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "1.5rem",
  },
  tableSkeleton: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    width: "100%",
  },
  tableRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.2rem",
  },
  block: {
    backgroundColor: "#1e293b",
    borderRadius: "6px",
    animation: "pulse 1.5s infinite ease-in-out",
  },
};

export default RecruiterLoadingSkeleton;
