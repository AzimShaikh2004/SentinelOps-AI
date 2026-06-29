import React, { useState, useEffect } from "react";
import socket from "../socket/socket";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";

const AutopilotConsole = ({ isAutopilotEnabled, onToggleAutopilot }) => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/monitor/autopilot/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setHistoryEvents(data);
      }
    } catch (err) {
      console.log("Failed to fetch autopilot history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const handleEventUpdate = (event) => {
      console.log("[Autopilot Socket] Received event update:", event);
      setActiveEvent(event);
      if (event.status === "RESOLVED" || event.status === "FAILED") {
        toast.info(`Autopilot healing attempt: ${event.status}`);
        // Refresh history after a short delay
        setTimeout(fetchHistory, 3000);
      }
    };

    socket.on("autopilot-event-update", handleEventUpdate);

    return () => {
      socket.off("autopilot-event-update", handleEventUpdate);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED": return "#10b981";
      case "FAILED": return "#ef4444";
      case "ACTIVE":
      case "DIAGNOSING":
      case "REMEDIATING": return "#8b5cf6";
      default: return "#94a3b8";
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        marginTop: "30px",
        padding: "25px",
      }}
    >
      <style>{`
        .spinner-mini {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-top: 2px solid #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ color: "white", margin: 0, fontSize: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span>🤖 SentinelSRE Autopilot</span>
          <span style={{
            fontSize: "12px",
            background: isAutopilotEnabled ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
            color: isAutopilotEnabled ? "#10b981" : "#64748b",
            padding: "4px 8px",
            borderRadius: "6px",
            border: isAutopilotEnabled ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255,255,255,0.08)"
          }}>
            {isAutopilotEnabled ? "ACTIVE AUTONOMIC STATE" : "STANDBY"}
          </span>
        </h2>

        {/* Toggle Switch */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>Self-Healing Mode</span>
          <button
            onClick={() => onToggleAutopilot(!isAutopilotEnabled)}
            style={{
              background: isAutopilotEnabled ? "linear-gradient(to right, #10b981, #059669)" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: isAutopilotEnabled ? "white" : "#94a3b8",
              padding: "8px 16px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
              boxShadow: isAutopilotEnabled ? "0 4px 15px rgba(16, 185, 129, 0.35)" : "none",
              transition: "all 0.3s ease"
            }}
          >
            {isAutopilotEnabled ? "ON (Auto-Recover)" : "OFF (Manual Only)"}
          </button>
        </div>
      </div>

      {/* Description */}
      <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5", marginBottom: "25px" }}>
        When enabled, SentinelSRE Autopilot autonomously intercepts high system metrics and active anomalies, writes diagnosis CLI scripts, executes them on your machine via WebSockets, and prompts Gemini to decide and execute remediation steps without human intervention.
      </p>

      {/* Active Run Timeline */}
      {activeEvent && (activeEvent.status === "ACTIVE" || activeEvent.status === "DIAGNOSING" || activeEvent.status === "REMEDIATING") ? (
        <div style={{
          background: "rgba(139, 92, 246, 0.05)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "25px"
        }}>
          <h3 style={{ color: "#a78bfa", fontSize: "16px", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="spinner-mini"></span> Active Autopilot Healing: {activeEvent.anomalyType} SPIKE
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {activeEvent.steps.map((step, idx) => (
              <div key={idx} style={{ borderLeft: "2px solid #8b5cf6", paddingLeft: "15px", position: "relative" }}>
                {/* Bullet node */}
                <div style={{
                  position: "absolute",
                  left: "-6px",
                  top: "2px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: step.status === "RUNNING" ? "#8b5cf6" : step.status === "COMPLETED" ? "#10b981" : "#ef4444"
                }}></div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ color: "white", fontSize: "14px" }}>{step.name}</strong>
                  <span style={{
                    fontSize: "11px",
                    color: step.status === "RUNNING" ? "#8b5cf6" : step.status === "COMPLETED" ? "#10b981" : "#ef4444",
                    fontWeight: "bold"
                  }}>
                    {step.status}
                  </span>
                </div>

                {step.command && (
                  <pre style={codeBlockStyle}>$ {step.command}</pre>
                )}

                {step.aiAnalysis && (
                  <div style={aiReasonStyle}>
                    <strong>AI SRE Analysis: </strong>{step.aiAnalysis}
                  </div>
                )}

                {step.output && (
                  <pre style={outputStyle}>{step.output.substring(0, 500)}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* History Events List */}
      <h3 style={{ color: "white", fontSize: "16px", marginBottom: "15px" }}>Self-Healing History Logs</h3>
      
      {historyLoading && historyEvents.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic" }}>Loading logs...</p>
      ) : historyEvents.length === 0 ? (
        <p style={{ color: "#64748b", fontStyle: "italic", margin: 0 }}>No autonomous recovery logs found yet. Trigger an anomaly to test.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {historyEvents.map((evt) => (
            <div key={evt._id} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "15px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onClick={() => setExpandedEventId(expandedEventId === evt._id ? null : evt._id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "white" }}>🤖 Autopilot Healing: {evt.anomalyType} Spike</strong>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                    Node: {evt.serverId} • {new Date(evt.createdAt).toLocaleString()}
                  </div>
                </div>
                <span style={{
                  background: `${getStatusColor(evt.status)}20`,
                  border: `1px solid ${getStatusColor(evt.status)}40`,
                  color: getStatusColor(evt.status),
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {evt.status}
                </span>
              </div>

              {/* Expanded details */}
              {expandedEventId === evt._id && (
                <div style={{ marginTop: "15px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "15px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {evt.steps.map((step, idx) => (
                      <div key={idx} style={{ borderLeft: "2px solid rgba(255,255,255,0.1)", paddingLeft: "15px", position: "relative" }}>
                        <div style={{
                          position: "absolute",
                          left: "-5px",
                          top: "2px",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: step.status === "COMPLETED" ? "#10b981" : "#ef4444"
                        }}></div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ color: "#94a3b8", fontSize: "13px" }}>{step.name}</strong>
                          <span style={{ fontSize: "11px", color: step.status === "COMPLETED" ? "#10b981" : "#ef4444" }}>{step.status}</span>
                        </div>

                        {step.command && <pre style={codeBlockStyle}>$ {step.command}</pre>}
                        {step.aiAnalysis && <div style={aiReasonStyle}><strong>AI SRE Analysis: </strong>{step.aiAnalysis}</div>}
                        {step.output && <pre style={outputStyle}>{step.output}</pre>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const codeBlockStyle = {
  background: "#010409",
  padding: "8px 12px",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "12px",
  color: "#38bdf8",
  marginTop: "6px",
  marginBottom: "6px",
  overflowX: "auto"
};

const outputStyle = {
  background: "#0d1117",
  padding: "8px 12px",
  borderRadius: "8px",
  fontFamily: "monospace",
  fontSize: "11px",
  color: "#10b981",
  marginTop: "6px",
  overflowX: "auto",
  maxHeight: "150px",
  overflowY: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all"
};

const aiReasonStyle = {
  background: "rgba(56, 189, 248, 0.08)",
  border: "1px solid rgba(56, 189, 248, 0.15)",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#e2e8f0",
  marginTop: "6px",
  lineHeight: "1.4"
};

export default AutopilotConsole;
