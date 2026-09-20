import { useState } from "react";

// =====================================================
// 1. PERFORMANCE OVERVIEW CHART (Average, Highest, Lowest Over Time)
// =====================================================
export function PerformanceOverviewChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <p style={chartStyles.emptyText}>No assessment performance history recorded yet.</p>
      </div>
    );
  }

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = 100;
  const minVal = 0;

  const getX = (index) => {
    if (data.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    return padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  };

  // Generate paths
  const avgPoints = data.map((d, i) => `${getX(i)},${getY(d.average)}`).join(" ");
  const highPoints = data.map((d, i) => `${getX(i)},${getY(d.highest)}`).join(" ");
  const lowPoints = data.map((d, i) => `${getX(i)},${getY(d.lowest)}`).join(" ");

  // Gradient area points for average
  const areaPoints = `${getX(0)},${padding.top + chartHeight} ` +
    avgPoints +
    ` ${getX(data.length - 1)},${padding.top + chartHeight}`;

  return (
    <div style={chartStyles.wrapper}>
      <div style={chartStyles.legendRow}>
        <div style={chartStyles.legendItem}>
          <span style={{ ...chartStyles.legendDot, backgroundColor: "#38bdf8" }} />
          <span>Average Score</span>
        </div>
        <div style={chartStyles.legendItem}>
          <span style={{ ...chartStyles.legendDot, backgroundColor: "#22c55e" }} />
          <span>Highest Score</span>
        </div>
        <div style={chartStyles.legendItem}>
          <span style={{ ...chartStyles.legendDot, backgroundColor: "#f87171" }} />
          <span>Lowest Score</span>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", minWidth: "480px" }}
        >
          <defs>
            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="end"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Average Fill Area */}
          <polygon points={areaPoints} fill="url(#avgGradient)" />

          {/* Highest Score Line */}
          <polyline
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={highPoints}
          />

          {/* Lowest Score Line */}
          <polyline
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={lowPoints}
          />

          {/* Average Score Line (Solid) */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            points={avgPoints}
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.average);
            const isHovered = hoveredIndex === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth={isHovered ? 3 : 2}
                />
                <text
                  x={cx}
                  y={height - 12}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.date ? d.date.slice(5) : `T${i + 1}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "20px",
              backgroundColor: "#090d16",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "0.6rem 0.85rem",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
              fontSize: "0.82rem",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>
              📅 {data[hoveredIndex].date}
            </div>
            <div style={{ color: "#38bdf8" }}>
              Avg: <strong>{data[hoveredIndex].average}%</strong>
            </div>
            <div style={{ color: "#4ade80" }}>
              High: <strong>{data[hoveredIndex].highest}%</strong>
            </div>
            <div style={{ color: "#fca5a5" }}>
              Low: <strong>{data[hoveredIndex].lowest}%</strong>
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "2px" }}>
              Tests: {data[hoveredIndex].count}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// 2. STUDENTS / ASSESSMENTS BY TARGET ROLE
// =====================================================
export function StudentsByRoleChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <p style={chartStyles.emptyText}>No role distribution data available.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const colors = ["#38bdf8", "#818cf8", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b", "#10b981"];

  return (
    <div style={chartStyles.barList}>
      {data.map((item, idx) => {
        const pct = Math.round((item.count / maxCount) * 100);
        const color = colors[idx % colors.length];

        return (
          <div key={item.role} style={chartStyles.barRow}>
            <div style={chartStyles.barLabelRow}>
              <span style={chartStyles.barLabel}>{item.role}</span>
              <div style={chartStyles.barStats}>
                <span style={{ color, fontWeight: "700" }}>{item.count} tests</span>
                {item.avgScore !== undefined && (
                  <span style={chartStyles.barAvgBadge}>Avg: {item.avgScore}%</span>
                )}
              </div>
            </div>
            <div style={chartStyles.track}>
              <div
                style={{
                  ...chartStyles.fill,
                  width: `${pct}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================
// 3. SKILL / TOPIC PERFORMANCE CHART
// =====================================================
export function SkillPerformanceChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <p style={chartStyles.emptyText}>No topic skill metrics recorded yet.</p>
      </div>
    );
  }

  return (
    <div style={chartStyles.barList}>
      {data.map((item) => {
        const pct = item.percentage || 0;
        const color = pct >= 80 ? "#22c55e" : pct >= 65 ? "#38bdf8" : pct >= 50 ? "#eab308" : "#ef4444";

        return (
          <div key={item.topic} style={chartStyles.barRow}>
            <div style={chartStyles.barLabelRow}>
              <span style={chartStyles.barLabel}>{item.topic}</span>
              <span style={{ color, fontWeight: "700", fontSize: "0.85rem" }}>{pct}%</span>
            </div>
            <div style={chartStyles.track}>
              <div
                style={{
                  ...chartStyles.fill,
                  width: `${pct}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================
// 4. ASSESSMENT COMPLETION TREND CHART
// =====================================================
export function CompletionTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <p style={chartStyles.emptyText}>No completion trend data available.</p>
      </div>
    );
  }

  const maxCompleted = Math.max(...data.map((d) => d.completed), 1);

  return (
    <div style={chartStyles.columnChartWrapper}>
      <div style={chartStyles.columnsContainer}>
        {data.map((item, idx) => {
          const heightPct = Math.round((item.completed / maxCompleted) * 100);
          return (
            <div key={idx} style={chartStyles.columnCol}>
              <div style={chartStyles.columnTrack}>
                <div
                  style={{
                    ...chartStyles.columnFill,
                    height: `${heightPct}%`,
                  }}
                  title={`${item.date}: ${item.completed} completed`}
                >
                  <span style={chartStyles.columnValue}>{item.completed}</span>
                </div>
              </div>
              <span style={chartStyles.columnLabel}>
                {item.date ? item.date.slice(5) : `D${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// 5. SCORE DISTRIBUTION HISTOGRAM
// =====================================================
export function ScoreDistributionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div style={chartStyles.emptyContainer}>
        <p style={chartStyles.emptyText}>No score distribution data available.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const colors = ["#ef4444", "#f97316", "#eab308", "#38bdf8", "#22c55e"];

  return (
    <div style={chartStyles.columnChartWrapper}>
      <div style={chartStyles.columnsContainer}>
        {data.map((item, idx) => {
          const heightPct = Math.round((item.count / maxCount) * 100);
          const color = colors[idx % colors.length];

          return (
            <div key={item.range} style={chartStyles.columnCol}>
              <div style={chartStyles.columnTrack}>
                <div
                  style={{
                    ...chartStyles.columnFill,
                    height: `${Math.max(heightPct, 8)}%`,
                    backgroundColor: color,
                  }}
                >
                  <span style={chartStyles.columnValue}>{item.count}</span>
                </div>
              </div>
              <span style={chartStyles.columnLabel}>{item.range}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const chartStyles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    width: "100%",
  },
  legendRow: {
    display: "flex",
    gap: "1.25rem",
    justifyContent: "flex-end",
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  legendDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
  barList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%",
  },
  barRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.88rem",
  },
  barLabel: {
    fontWeight: "600",
    color: "#f8fafc",
  },
  barStats: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "0.8rem",
  },
  barAvgBadge: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    padding: "0.15rem 0.45rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
  },
  track: {
    height: "7px",
    backgroundColor: "#1e293b",
    borderRadius: "4px",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.4s ease",
  },
  columnChartWrapper: {
    width: "100%",
    height: "180px",
    display: "flex",
    alignItems: "flex-end",
  },
  columnsContainer: {
    display: "flex",
    width: "100%",
    height: "100%",
    gap: "0.75rem",
    alignItems: "flex-end",
  },
  columnCol: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
  },
  columnTrack: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  columnFill: {
    width: "70%",
    maxWidth: "40px",
    backgroundColor: "#38bdf8",
    borderRadius: "6px 6px 0 0",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "4px",
    transition: "height 0.4s ease",
  },
  columnValue: {
    fontSize: "0.75rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  columnLabel: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  emptyContainer: {
    padding: "2rem 1rem",
    textAlign: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "0.85rem",
    margin: 0,
  },
};
