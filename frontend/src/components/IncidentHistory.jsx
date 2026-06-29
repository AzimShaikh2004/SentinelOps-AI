const IncidentHistory = ({ incidents }) => {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case "HIGH": return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", label: "CRITICAL" };
      case "MEDIUM": return { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.08)", label: "WARNING" };
      default: return { color: "#06d6a0", bg: "rgba(6, 214, 160, 0.08)", label: "INFO" };
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: "30px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 24px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>📋</span>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "18px",
            fontWeight: "700",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Incident Timeline
          </h2>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.15)",
          color: "#ef4444",
          padding: "6px 14px",
          borderRadius: "10px",
          fontWeight: "700",
          fontSize: "12px",
          letterSpacing: "0.05em",
        }}>
          <span style={{ fontSize: "11px" }}>⚡</span>
          {incidents.length} INCIDENTS
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0, 0, 0, 0.15)" }}>
              {["Type", "Severity", "Message", "Server", "Timestamp"].map((header) => (
                <th key={header} style={{
                  padding: "14px 20px",
                  textAlign: "left",
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident, index) => {
              const config = getSeverityConfig(incident.severity);
              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.02)",
                    transition: "background 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#cbd5e1", fontWeight: "600" }}>
                    {incident.type}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: config.bg,
                      color: config.color,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.05em",
                      border: `1px solid ${config.color}20`,
                    }}>
                      <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: config.color,
                        boxShadow: `0 0 6px ${config.color}60`,
                      }} />
                      {config.label}
                    </span>
                  </td>
                  <td style={{
                    padding: "14px 20px",
                    fontSize: "13px",
                    color: "#94a3b8",
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {incident.message}
                  </td>
                  <td style={{
                    padding: "14px 20px",
                    fontSize: "13px",
                    color: "#64748b",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                  }}>
                    {incident.server || "localhost"}
                  </td>
                  <td style={{
                    padding: "14px 20px",
                    fontSize: "12px",
                    color: "#475569",
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: "nowrap",
                  }}>
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {incidents.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            color: "#475569",
            gap: "8px",
          }}>
            <span style={{ fontSize: "28px", opacity: 0.4 }}>✅</span>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>No incidents recorded</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentHistory;