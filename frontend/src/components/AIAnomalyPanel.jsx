import { useState } from "react";
import { toast } from "react-toastify";
import TerminalConsole from "./TerminalConsole";
import { API_BASE_URL } from "../config";

const AIAnomalyPanel = ({
  anomalies,
  hostname,
  platform,
}) => {
  const [showRemediation, setShowRemediation] = useState(false);
  const [remediationData, setRemediationData] = useState(null);
  const [loadingRemediation, setLoadingRemediation] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState("");

  const fetchRemediation = async (anomaly) => {
    setLoadingRemediation(true);
    setActiveAnomaly(anomaly);
    setShowRemediation(true);
    setRemediationData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics/ai-remediation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          anomalyType: anomaly.type,
          anomalyMessage: anomaly.message,
          hostname: hostname,
          platform: platform,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRemediationData(data);
      } else {
        toast.error(data.message || "Failed to fetch AI remediation steps");
        setShowRemediation(false);
      }
    } catch (error) {
      toast.error("Network error while fetching SRE remediation");
      setShowRemediation(false);
    } finally {
      setLoadingRemediation(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const getSeverityColor = (
    severity
  ) => {
    switch (severity) {
      case "HIGH":
        return "#ef4444";

      case "MEDIUM":
        return "#f59e0b";

      case "LOW":
        return "#22c55e";

      default:
        return "#38bdf8";
    }
  };

  const getSeverityGlow = (
    severity
  ) => {
    switch (severity) {
      case "HIGH":
        return "0 0 20px rgba(239,68,68,0.35)";

      case "MEDIUM":
        return "0 0 20px rgba(245,158,11,0.35)";

      case "LOW":
        return "0 0 20px rgba(34,197,94,0.35)";

      default:
        return "0 0 20px rgba(56,189,248,0.35)";
    }
  };

  return (
    <div
      id="ai-anomaly-panel"
      style={{
        marginTop: "30px",

        background:
          "rgba(30,41,59,0.7)",

        padding: "25px",

        borderRadius: "18px",

        border:
          "1px solid rgba(255,255,255,0.08)",

        boxShadow:
          "0 8px 20px rgba(0,0,0,0.25)",
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

          justifyContent:
            "space-between",

          alignItems: "center",

          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            color: "white",

            margin: 0,

            fontSize: "28px",
          }}
        >
          🤖 AI Anomaly Detection
        </h2>

        <div
          style={{
            background:
              "rgba(255,255,255,0.05)",

            padding: "8px 14px",

            borderRadius: "10px",

            color: "#94a3b8",

            fontSize: "14px",
          }}
        >
          {anomalies.length} Active
        </div>
      </div>

      {anomalies &&
      anomalies.length > 0 ? (
        anomalies.map(
          (anomaly, index) => (
            <div
              key={index}
              style={{
                background:
                  "rgba(255,255,255,0.04)",

                borderLeft: `5px solid ${getSeverityColor(
                  anomaly.severity
                )}`,

                padding: "20px",

                borderRadius: "14px",

                marginBottom: "18px",

                boxShadow:
                  getSeverityGlow(
                    anomaly.severity
                  ),
              }}
            >
              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  marginBottom: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      color:
                        "#94a3b8",

                      fontSize: "12px",

                      marginBottom: "6px",
                    }}
                  >
                    {anomaly.time}
                  </div>

                  <strong
                    style={{
                      color:
                        getSeverityColor(
                          anomaly.severity
                        ),

                      fontSize: "20px",
                    }}
                  >
                    {anomaly.type} ALERT
                  </strong>
                </div>

                <span
                  style={{
                    background:
                      getSeverityColor(
                        anomaly.severity
                      ),

                    color: "white",

                    padding:
                      "6px 12px",

                    borderRadius: "999px",

                    fontSize: "12px",

                    fontWeight: "bold",
                  }}
                >
                  {anomaly.severity}
                </span>
              </div>

              <p
                style={{
                  color: "white",

                  fontSize: "16px",

                  marginBottom: "18px",
                }}
              >
                {anomaly.message}
              </p>

              {anomaly.aiAnalysis && (
                <div
                  style={{
                    background:
                      "rgba(59,130,246,0.08)",

                    padding: "14px",

                    borderRadius: "12px",

                    marginBottom: "12px",

                    border:
                      "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#38bdf8",

                      fontWeight:
                        "bold",

                      marginBottom:
                        "8px",
                    }}
                  >
                    🤖 AI Analysis
                  </div>

                  <div
                    style={{
                      color:
                        "#e2e8f0",

                      lineHeight:
                        "1.6",
                    }}
                  >
                    {
                      anomaly.aiAnalysis
                    }
                  </div>
                </div>
              )}

              {anomaly.recommendation && (
                <div
                  style={{
                    background:
                      "rgba(34,197,94,0.08)",

                    padding: "14px",

                    borderRadius: "12px",

                    marginBottom: "12px",

                    border:
                      "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#22c55e",

                      fontWeight:
                        "bold",

                      marginBottom:
                        "8px",
                    }}
                  >
                    💡 Recommendation
                  </div>

                  <div
                    style={{
                      color:
                        "#e2e8f0",

                      lineHeight:
                        "1.6",
                    }}
                  >
                    {
                      anomaly.recommendation
                    }
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                {anomaly.confidence ? (
                  <div
                    style={{
                      display: "inline-block",

                      background:
                        "rgba(255,255,255,0.06)",

                      padding:
                        "8px 14px",

                      borderRadius:
                        "999px",

                      color:
                        "#facc15",

                      fontWeight:
                        "bold",
                    }}
                  >
                    Confidence: {anomaly.confidence}%
                  </div>
                ) : (
                  <div></div>
                )}

                <button
                  onClick={() => fetchRemediation(anomaly)}
                  style={{
                    background: "rgba(56,189,248,0.15)",
                    border: "1px solid rgba(56,189,248,0.4)",
                    color: "#38bdf8",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  🤖 AI Remediation
                </button>
              </div>
            </div>
          )
        )
      ) : (
        <div
          style={{
            background:
              "rgba(255,255,255,0.03)",

            padding: "25px",

            borderRadius: "14px",

            textAlign: "center",

            color: "#94a3b8",

            fontSize: "16px",
          }}
        >
          ✅ No anomalies detected.
          <br />
          System operating normally.
        </div>
      )}

      {showRemediation && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "white", fontSize: "22px" }}>
                🤖 AI Anomaly Remediation: {activeAnomaly?.type}
              </h3>
              <button onClick={() => setShowRemediation(false)} style={closeButtonStyle}>×</button>
            </div>

            {loadingRemediation ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={spinnerStyle}></div>
                <p style={{ color: "#94a3b8", marginTop: "15px" }}>Gemini SRE is generating safe CLI commands...</p>
              </div>
            ) : remediationData ? (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={sectionLabelStyle}>🔍 Diagnostic Commands</div>
                  <div style={codeBlockContainerStyle}>
                    <pre style={codeBlockStyle}>{remediationData.diagnose}</pre>
                    <button 
                      onClick={() => {
                        setTerminalCommand(remediationData.diagnose);
                        setShowTerminal(true);
                      }} 
                      style={{ ...copyButtonStyle, right: "80px", background: "rgba(56, 189, 248, 0.25)", border: "1px solid rgba(56, 189, 248, 0.4)", color: "#38bdf8" }}
                    >
                      ⚡ Run
                    </button>
                    <button 
                      onClick={() => copyToClipboard(remediationData.diagnose, "Diagnostic commands")} 
                      style={copyButtonStyle}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={sectionLabelStyle}>🛠 Remediation Script / Command</div>
                  <div style={codeBlockContainerStyle}>
                    <pre style={codeBlockStyle}>{remediationData.remediate}</pre>
                    <button 
                      onClick={() => {
                        setTerminalCommand(remediationData.remediate);
                        setShowTerminal(true);
                      }} 
                      style={{ ...copyButtonStyle, right: "80px", background: "rgba(16, 185, 129, 0.25)", border: "1px solid rgba(16, 185, 129, 0.4)", color: "#10b981" }}
                    >
                      ⚡ Run
                    </button>
                    <button 
                      onClick={() => copyToClipboard(remediationData.remediate, "Remediation script")} 
                      style={copyButtonStyle}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                <div style={notesStyle}>
                  <span style={{ fontWeight: "bold" }}>SRE Caution Notes: </span>
                  {remediationData.notes}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "25px" }}>
                  <button onClick={() => setShowRemediation(false)} style={closeBtnStyle}>Close</button>
                </div>
              </div>
            ) : (
              <p style={{ color: "#ef4444" }}>Failed to generate remediation data.</p>
            )}
          </div>
        </div>
      )}

      {showTerminal && (
        <TerminalConsole 
          command={terminalCommand} 
          serverId={hostname || "Laptop-1"} 
          onClose={() => setShowTerminal(false)} 
        />
      )}
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1100,
};

const modalContentStyle = {
  background: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  padding: "30px",
  borderRadius: "20px",
  width: "90%",
  maxWidth: "600px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
  color: "white",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  color: "#94a3b8",
  fontSize: "28px",
  cursor: "pointer",
};

const sectionLabelStyle = {
  color: "#38bdf8",
  fontSize: "14px",
  fontWeight: "bold",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const codeBlockContainerStyle = {
  position: "relative",
  background: "rgba(0, 0, 0, 0.4)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  padding: "15px",
  margin: 0,
};

const codeBlockStyle = {
  margin: 0,
  padding: 0,
  fontFamily: "monospace",
  fontSize: "14px",
  color: "#e2e8f0",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

const copyButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "rgba(255, 255, 255, 0.1)",
  border: "none",
  color: "white",
  padding: "5px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "bold",
};

const notesStyle = {
  background: "rgba(245, 158, 11, 0.08)",
  border: "1px solid rgba(245, 158, 11, 0.2)",
  borderRadius: "12px",
  padding: "15px",
  color: "#fdba74",
  fontSize: "14px",
  lineHeight: "1.5",
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

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "4px solid rgba(56, 189, 248, 0.1)",
  borderTop: "4px solid #38bdf8",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto",
};

export default AIAnomalyPanel;
