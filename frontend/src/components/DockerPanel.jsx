import React, { useState } from "react";
import { toast } from "react-toastify";

const DockerPanel = ({ containers }) => {
  const [actionLoading, setActionLoading] = useState(null);
  
  // Container logs states
  const [showLogs, setShowLogs] = useState(false);
  const [activeContainerLogs, setActiveContainerLogs] = useState("");
  const [activeContainerName, setActiveContainerName] = useState("");
  const [activeContainerId, setActiveContainerId] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  const handleAction = async (containerId, action) => {
    setActionLoading(containerId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/monitor/containers/${containerId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Container ${action}ed successfully!`);
      } else {
        toast.error(data.message || `Failed to ${action} container.`);
      }
    } catch (error) {
      toast.error(`Error: Failed to ${action} container.`);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchLogs = async (containerId, containerName) => {
    setActiveContainerId(containerId);
    setActiveContainerName(containerName);
    setShowLogs(true);
    setLogsLoading(true);
    setActiveContainerLogs("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/monitor/containers/${containerId}/logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setActiveContainerLogs(data.logs || "No logs available for this container.");
      } else {
        toast.error(data.message || "Failed to fetch container logs.");
      }
    } catch (error) {
      toast.error("Error connecting to server to fetch logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        marginTop: "30px",
        padding: "25px",
        overflowX: "auto",
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "white", margin: 0, fontSize: "20px" }}>
          🐳 Docker Container Monitoring
        </h2>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "8px 14px",
            borderRadius: "10px",
            color: "#94a3b8",
            fontSize: "14px",
          }}
        >
          {containers.length} Containers
        </div>
      </div>

      {containers.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            padding: "25px",
            borderRadius: "14px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          No running containers found
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <th style={thStyle}>Container ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Image</th>
              <th style={thStyle}>State</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>CPU</th>
              <th style={thStyle}>Memory</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {containers.map((container, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <td style={tdStyle}>{container.id}</td>
                <td style={tdStyle}>{container.name}</td>
                <td style={tdStyle}>{container.image}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      color: container.state === "running" ? "#10b981" : "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    {container.state}
                  </span>
                </td>
                <td style={tdStyle}>{container.status}</td>
                <td style={{ ...tdStyle, color: "#10b981", fontWeight: "bold" }}>
                  {container.cpu}
                </td>
                <td style={tdStyle}>{container.memory}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {container.state === "running" ? (
                      <>
                        <button
                          onClick={() => handleAction(container.id, "stop")}
                          disabled={actionLoading === container.id}
                          style={stopButtonStyle}
                        >
                          {actionLoading === container.id ? "Stopping..." : "Stop"}
                        </button>
                        <button
                          onClick={() => handleAction(container.id, "restart")}
                          disabled={actionLoading === container.id}
                          style={restartButtonStyle}
                        >
                          {actionLoading === container.id ? "Restarting..." : "Restart"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAction(container.id, "start")}
                        disabled={actionLoading === container.id}
                        style={startButtonStyle}
                      >
                        {actionLoading === container.id ? "Starting..." : "Start"}
                      </button>
                    )}
                    <button
                      onClick={() => fetchLogs(container.id, container.name)}
                      style={logsButtonStyle}
                    >
                      Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Container Logs Overlay */}
      {showLogs && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} className="glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "white", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                🐳 logs @ {activeContainerName}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => fetchLogs(activeContainerId, activeContainerName)} 
                  disabled={logsLoading}
                  style={refreshBtnStyle}
                >
                  {logsLoading ? "Reading..." : "🔄 Refresh"}
                </button>
                <button onClick={() => setShowLogs(false)} style={closeButtonStyle}>×</button>
              </div>
            </div>

            {logsLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={spinnerStyle}></div>
                <p style={{ color: "#94a3b8", marginTop: "15px" }}>Loading logs from Docker daemon...</p>
              </div>
            ) : (
              <div style={logsContainerStyle}>
                {activeContainerLogs}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button 
                onClick={() => setShowLogs(false)} 
                style={closeBtnStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "16px",
  color: "#94a3b8",
};

const tdStyle = {
  padding: "18px 16px",
  color: "white",
};

const stopButtonStyle = {
  background: "rgba(239, 68, 68, 0.15)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#ef4444",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
  outline: "none",
};

const restartButtonStyle = {
  background: "rgba(245, 158, 11, 0.15)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  color: "#f59e0b",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
  outline: "none",
};

const startButtonStyle = {
  background: "rgba(16, 185, 129, 0.15)",
  border: "1px solid rgba(16, 185, 129, 0.3)",
  color: "#10b981",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
  outline: "none",
};

const logsButtonStyle = {
  background: "rgba(56, 189, 248, 0.15)",
  border: "1px solid rgba(56, 189, 248, 0.3)",
  color: "#38bdf8",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
  outline: "none",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(6px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1100,
};

const modalContentStyle = {
  background: "#020617",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "30px",
  borderRadius: "20px",
  width: "90%",
  maxWidth: "750px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
  color: "white",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  color: "#94a3b8",
  fontSize: "24px",
  cursor: "pointer",
};

const spinnerStyle = {
  width: "35px",
  height: "35px",
  border: "3px solid rgba(56, 189, 248, 0.1)",
  borderTop: "3px solid #38bdf8",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto",
};

const refreshBtnStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  color: "#94a3b8",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};

const closeBtnStyle = {
  background: "linear-gradient(to right, #38bdf8, #0284c7)",
  border: "none",
  color: "white",
  padding: "10px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const logsContainerStyle = {
  background: "#010409",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  padding: "15px",
  maxHeight: "350px",
  overflowY: "auto",
  fontFamily: "Courier New, monospace",
  fontSize: "13px",
  lineHeight: "1.6",
  color: "#38bdf8",
  whiteSpace: "pre-wrap",
  textAlign: "left",
};

export default DockerPanel;