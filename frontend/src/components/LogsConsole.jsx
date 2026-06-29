import { useEffect, useRef } from "react";

const LogsConsole = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type) => {
    switch (type) {
      case "INFO": return "#06d6a0";
      case "SOCKET": return "#38bdf8";
      case "WARNING": return "#fbbf24";
      case "ERROR": return "#ef4444";
      case "DEBUG": return "#a78bfa";
      default: return "#94a3b8";
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case "INFO": return "●";
      case "SOCKET": return "◆";
      case "WARNING": return "▲";
      case "ERROR": return "✖";
      case "DEBUG": return "◇";
      default: return "○";
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        marginTop: "30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Terminal header bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        background: "rgba(0, 0, 0, 0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* macOS-style traffic lights */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", opacity: 0.8 }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24", opacity: 0.8 }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", opacity: 0.8 }} />
          </div>
          <span style={{
            fontSize: "13px",
            fontWeight: "700",
            color: "#94a3b8",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}>
            sentinel-ops ~ live-logs
          </span>
        </div>
        <div style={{
          fontSize: "11px",
          color: "#64748b",
          fontFamily: "'JetBrains Mono', monospace",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#06d6a0",
            boxShadow: "0 0 8px rgba(6, 214, 160, 0.5)",
            animation: "pulse-dot 2s infinite",
          }} />
          STREAMING
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={scrollRef}
        style={{
          padding: "16px 20px",
          height: "320px",
          overflowY: "auto",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: "13px",
          lineHeight: "1.7",
          background: "rgba(0, 0, 0, 0.15)",
        }}
      >
        {logs && logs.length > 0 ? (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "4px 0",
                borderBottom: "1px solid rgba(255, 255, 255, 0.02)",
                animation: index === logs.length - 1 ? "log-enter 0.3s ease both" : "none",
              }}
            >
              <span style={{
                color: "#475569",
                fontSize: "12px",
                minWidth: "75px",
                flexShrink: 0,
                marginTop: "2px",
              }}>
                {log.time}
              </span>
              <span style={{
                color: getLogColor(log.type),
                fontSize: "11px",
                marginTop: "3px",
                textShadow: `0 0 6px ${getLogColor(log.type)}40`,
              }}>
                {getLogIcon(log.type)}
              </span>
              <span style={{
                color: getLogColor(log.type),
                fontWeight: "700",
                fontSize: "11px",
                minWidth: "60px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "2px",
              }}>
                {log.type}
              </span>
              <span style={{
                color: "#cbd5e1",
                wordBreak: "break-word",
                flex: 1,
              }}>
                {log.message}
              </span>
            </div>
          ))
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#475569",
            gap: "12px",
          }}>
            <span style={{ fontSize: "28px", opacity: 0.4 }}>📡</span>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>Waiting for log stream...</span>
            <span style={{ fontSize: "11px", color: "#334155" }}>Logs will appear here as they are received</span>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div style={{
        padding: "8px 20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.04)",
        background: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#475569",
      }}>
        <span>{logs ? logs.length : 0} entries</span>
        <span>UTF-8 • LF</span>
      </div>

      <style>{`
        @keyframes log-enter {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default LogsConsole;