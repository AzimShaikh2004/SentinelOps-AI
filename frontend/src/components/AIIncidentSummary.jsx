const AIIncidentSummary = ({ incidents = [] }) => {
  const memoryCount = incidents.filter((i) => i.type === "MEMORY").length;
  const cpuCount = incidents.filter((i) => i.type === "CPU").length;
  const networkCount = incidents.filter((i) => i.type === "NETWORK").length;
  const offlineCount = incidents.filter((i) => i.type === "SERVER_OFFLINE").length;
  const total = incidents.length;

  let rootCause = "System operating normally.";
  let recommendation = "Continue monitoring.";
  let severity = "healthy";

  if (memoryCount > cpuCount) {
    rootCause = "High memory consumption is the dominant issue.";
    recommendation = "Investigate memory leaks and optimize resource usage.";
    severity = "warning";
  }
  if (cpuCount > memoryCount) {
    rootCause = "CPU spikes are the dominant issue.";
    recommendation = "Inspect running processes and optimize workloads.";
    severity = "warning";
  }
  if (offlineCount > 0) {
    rootCause = "Server connectivity issues detected.";
    recommendation = "Verify server health and network availability.";
    severity = "critical";
  }

  const stats = [
    { label: "Memory", count: memoryCount, color: "#a78bfa", icon: "🧠" },
    { label: "CPU", count: cpuCount, color: "#06d6a0", icon: "⚡" },
    { label: "Network", count: networkCount, color: "#38bdf8", icon: "🌐" },
    { label: "Offline", count: offlineCount, color: "#ef4444", icon: "🔴" },
  ];

  return (
    <div className="glass-panel" style={{ marginTop: "30px", overflow: "hidden" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>🧠</span>
          <h2 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "700", margin: 0 }}>AI Incident Summary</h2>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: `${total > 0 ? "rgba(251, 191, 36, 0.08)" : "rgba(6, 214, 160, 0.08)"}`,
          border: `1px solid ${total > 0 ? "rgba(251, 191, 36, 0.15)" : "rgba(6, 214, 160, 0.15)"}`,
          color: total > 0 ? "#fbbf24" : "#06d6a0",
          padding: "6px 14px",
          borderRadius: "10px",
          fontWeight: "700",
          fontSize: "12px",
          letterSpacing: "0.05em",
        }}>
          {total} TOTAL
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: `${stat.color}08`,
              border: `1px solid ${stat.color}15`,
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}>
              <span style={{ fontSize: "16px" }}>{stat.icon}</span>
              <p style={{
                fontSize: "28px",
                fontWeight: "800",
                color: stat.color,
                fontFamily: "'Outfit', sans-serif",
                margin: "6px 0 2px",
                letterSpacing: "-0.03em",
              }}>
                {stat.count}
              </p>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Analysis */}
        <div style={{
          background: severity === "critical"
            ? "rgba(239, 68, 68, 0.04)"
            : severity === "warning"
              ? "rgba(251, 191, 36, 0.04)"
              : "rgba(6, 214, 160, 0.04)",
          border: `1px solid ${severity === "critical" ? "rgba(239, 68, 68, 0.1)" : severity === "warning" ? "rgba(251, 191, 36, 0.1)" : "rgba(6, 214, 160, 0.1)"}`,
          borderRadius: "14px",
          padding: "18px 20px",
        }}>
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🔍 Root Cause Analysis
            </span>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", margin: "8px 0 0" }}>{rootCause}</p>
          </div>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              💡 Recommendation
            </span>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", margin: "8px 0 0" }}>{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIncidentSummary;