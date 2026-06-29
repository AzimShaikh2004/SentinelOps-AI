const MultiServerPanel = ({ servers }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "ONLINE": return { color: "#06d6a0", bg: "rgba(6, 214, 160, 0.08)", label: "ONLINE", icon: "●" };
      case "WARNING": return { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.08)", label: "WARNING", icon: "▲" };
      default: return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", label: "OFFLINE", icon: "✖" };
    }
  };

  const onlineCount = servers.filter(s => s.status === "ONLINE").length;

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
          <span style={{ fontSize: "20px" }}>🖥</span>
          <h2 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "700", margin: 0 }}>
            Multi-Server Fleet
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#06d6a0",
            background: "rgba(6, 214, 160, 0.08)",
            border: "1px solid rgba(6, 214, 160, 0.15)",
            padding: "4px 10px",
            borderRadius: "8px",
            letterSpacing: "0.05em",
          }}>
            {onlineCount} ONLINE
          </span>
          <span style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "#38bdf8",
            background: "rgba(56, 189, 248, 0.08)",
            border: "1px solid rgba(56, 189, 248, 0.15)",
            padding: "4px 10px",
            borderRadius: "8px",
            letterSpacing: "0.05em",
          }}>
            {servers.length} TOTAL
          </span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0, 0, 0, 0.15)" }}>
              {["Server", "Status", "CPU %", "Memory %", "Download", "Upload", "Last Update"].map((h) => (
                <th key={h} style={{
                  padding: "14px 20px",
                  textAlign: "left",
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {servers.map((server, index) => {
              const statusConfig = getStatusConfig(server.status);
              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.02)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#f1f5f9", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" }}>
                    {server.serverId}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.05em",
                      border: `1px solid ${statusConfig.color}20`,
                    }}>
                      <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: statusConfig.color,
                        boxShadow: `0 0 6px ${statusConfig.color}60`,
                      }} />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td style={{
                    padding: "14px 20px",
                    fontSize: "13px",
                    color: server.cpu > 80 ? "#ef4444" : "#06d6a0",
                    fontWeight: "700",
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {server.cpu}%
                  </td>
                  <td style={{
                    padding: "14px 20px",
                    fontSize: "13px",
                    color: server.memory > 80 ? "#ef4444" : "#a78bfa",
                    fontWeight: "700",
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {server.memory}%
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                    {server.download} MB/s
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>
                    {server.upload} MB/s
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "12px", color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}>
                    {server.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {servers.length === 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            color: "#475569",
            gap: "8px",
          }}>
            <span style={{ fontSize: "28px", opacity: 0.4 }}>📡</span>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>No remote servers connected</span>
            <span style={{ fontSize: "11px", color: "#334155" }}>Deploy agents to monitor remote infrastructure</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiServerPanel;