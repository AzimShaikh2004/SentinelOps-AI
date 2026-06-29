import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import socket from "../socket/socket";
import CPUChart from "../components/CPUChart";
import NetworkChart from "../components/NetworkChart";
import GaugeCard from "../components/GaugeCard";
import LogsConsole from "../components/LogsConsole";
import AIAnomalyPanel from "../components/AIAnomalyPanel";
import DockerPanel from "../components/DockerPanel";
import MultiServerPanel from "../components/MultiServerPanel";
import IncidentHistory from "../components/IncidentHistory";
import NotificationCenter from "../components/NotificationCenter";
import HistoricalCPUChart from "../components/HistoricalCPUChart";
import AIIncidentSummary from "../components/AIIncidentSummary";
import { jwtDecode } from "jwt-decode";
import AIAnalysisCard from "../components/AIAnalysisCard";
import AutopilotConsole from "../components/AutopilotConsole";

const Dashboard = () => {
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false);
  const handleToggleAutopilot = (enabled) => {
    socket.emit("toggle-autopilot", { enabled });
  };
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [networkChartData, setNetworkChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [containers, setContainers] = useState([]);
  const [servers, setServers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [historicalMetrics, setHistoricalMetrics] = useState([]);
  const [userRole, setUserRole] = useState("");
  const shownNotifications = useRef({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [slackUrl, setSlackUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "bot", text: "Hello! I am your SentinelOps SRE assistant. Ask me anything about your infrastructure." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyDesc, setNewKeyDesc] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/integrations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSlackUrl(data.slackWebhookUrl || "");
        setDiscordUrl(data.discordWebhookUrl || "");
      }
    } catch (error) { console.log("Failed to fetch integrations:", error); }
  };

  const updateIntegrations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ slackWebhookUrl: slackUrl, discordWebhookUrl: discordUrl }),
      });
      if (response.ok) { toast.success("Integrations updated!"); setShowSettingsModal(false); }
      else { const data = await response.json(); toast.error(data.message || "Failed"); }
    } catch (error) { toast.error("Failed to update integrations"); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;
    const userMsg = { sender: "user", text: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setChatLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/metrics/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ message: chatMessage, history: [...chatHistory, userMsg] }),
      });
      const data = await response.json();
      if (response.ok) setChatHistory((prev) => [...prev, { sender: "bot", text: data.reply }]);
      else toast.error(data.message || "Failed");
    } catch (error) { toast.error("Failed to connect to SRE chat"); }
    finally { setChatLoading(false); }
  };

  const handleManualDiagnostic = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/metrics/ai-analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) { setAiAnalysis(data); toast.success("AI Diagnostic complete!"); }
      else toast.error(data.message || "Failed");
    } catch (error) { toast.error("Failed to run diagnostics"); }
    finally { setAiLoading(false); }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/api-keys", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) setApiKeys(data);
    } catch (error) { console.log("Failed to fetch API keys:", error); }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ description: newKeyDesc }),
      });
      const data = await response.json();
      if (response.ok) { toast.success("API Key generated!"); setNewKeyDesc(""); fetchApiKeys(); }
      else toast.error(data.message || "Failed");
    } catch (error) { toast.error("Failed to generate key"); }
  };

  const deleteApiKey = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) { toast.success("API Key revoked!"); fetchApiKeys(); }
      else { const data = await response.json(); toast.error(data.message || "Failed"); }
    } catch (error) { toast.error("Failed to revoke key"); }
  };

  useEffect(() => {
    fetchApiKeys();
    fetchIntegrations();
    const fetchIncidents = async () => {
      try { const response = await fetch("http://localhost:5000/api/incidents"); const data = await response.json(); setIncidents(data); }
      catch (error) { console.log(error); }
    };
    fetchIncidents();
    const incidentInterval = setInterval(fetchIncidents, 5000);
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/metrics/history");
        const data = await response.json();
        const formatted = data.reverse().map((metric) => ({ cpuUsage: metric.cpuUsage, time: new Date(metric.createdAt).toLocaleTimeString() }));
        setHistoricalMetrics(formatted);
      } catch (error) { console.log(error); }
    };
    fetchHistory();
    const historyInterval = setInterval(fetchHistory, 60000);

    socket.on("ai-analysis", (data) => setAiAnalysis(data));
    socket.on("new-incident", (incident) => setIncidents((prev) => [incident, ...prev]));
    socket.on("system-metrics", (data) => {
      setMetrics(data);
      const newAlerts = [];
      if (parseInt(data.cpuUsage) > 80) {
        const cpuNow = Date.now();
        const cpuLastShown = shownNotifications.current["high-cpu"];
        if (!cpuLastShown || cpuNow - cpuLastShown > 60000) {
          shownNotifications.current["high-cpu"] = cpuNow;
          toast.error(`🔥 High CPU Usage: ${data.cpuUsage}%`);
        }
        newAlerts.push({ id: `cpu-${Date.now()}`, type: "critical", message: `High CPU Usage: ${data.cpuUsage}%`, time: new Date().toLocaleTimeString() });
      }
      if (parseInt(data.memoryUsagePercentage) > 90) {
        const memoryNow = Date.now();
        const memoryLastShown = shownNotifications.current["high-memory"];
        if (!memoryLastShown || memoryNow - memoryLastShown > 60000) {
          shownNotifications.current["high-memory"] = memoryNow;
          toast.warning(`⚠ High Memory: ${data.memoryUsagePercentage}%`);
        }
        newAlerts.push({ id: `memory-${Date.now()}`, type: "warning", message: `High Memory Usage: ${data.memoryUsagePercentage}%`, time: new Date().toLocaleTimeString() });
      }
      if (newAlerts.length > 0) {
        setAlerts((prev) => {
          const filtered = newAlerts.filter((a) => !prev.some((e) => e.message === a.message));
          return [...filtered, ...prev].slice(0, 5);
        });
      }
      setChartData((prevData) => [...prevData, { time: new Date().toLocaleTimeString(), usage: parseInt(data.cpuUsage) }].slice(-10));
      setNetworkChartData((prevData) => [...prevData, { time: new Date().toLocaleTimeString(), download: parseFloat(data.downloadSpeed), upload: parseFloat(data.uploadSpeed) }].slice(-10));
    });
    socket.on("docker-containers", (data) => setContainers(data));
    socket.on("multi-server-data", (data) => setServers(data));
    socket.on("system-logs", (data) => setLogs(data));
    socket.on("system-anomalies", (data) => {
      if (data.length > 0) {
        data.forEach((anomaly) => {
          const now = Date.now();
          const lastShown = shownNotifications.current[anomaly.message];
          if (!lastShown || now - lastShown > 60000) {
            shownNotifications.current[anomaly.message] = now;
            toast.info(`🤖 ${anomaly.message}`);
            setNotifications((prev) => [{ type: anomaly.type, severity: anomaly.severity, message: anomaly.message, time: new Date().toLocaleTimeString(), read: false }, ...prev].slice(0, 20));
          }
        });
        setAnomalies((prev) => data.map((newAnomaly) => {
          const existing = prev.find((p) => p.message === newAnomaly.message);
          return existing || { ...newAnomaly, id: Date.now() + Math.random(), time: new Date().toLocaleTimeString() };
        }));
      } else { setAnomalies([]); }
    });
    socket.on("autopilot-status", (data) => setIsAutopilotEnabled(data.enabled));

    return () => {
      clearInterval(incidentInterval);
      clearInterval(historyInterval);
      socket.off("new-incident");
      socket.off("system-metrics");
      socket.off("docker-containers");
      socket.off("multi-server-data");
      socket.off("system-logs");
      socket.off("system-anomalies");
      socket.off("ai-analysis");
      socket.off("autopilot-status");
    };
  }, []);

  useEffect(() => { const i = setInterval(() => setAlerts((p) => p.slice(0, 4)), 20000); return () => clearInterval(i); }, []);
  useEffect(() => { const i = setInterval(() => setAnomalies((p) => p.slice(0, 6)), 30000); return () => clearInterval(i); }, []);

  const getSystemStatus = () => {
    if (!metrics) return { label: "Connecting...", color: "#64748b", dot: "rgba(100, 116, 139, 0.5)" };
    const usage = parseInt(metrics.cpuUsage);
    if (usage < 50) return { label: "Healthy", color: "#06d6a0", dot: "rgba(6, 214, 160, 0.5)" };
    if (usage < 80) return { label: "Warning", color: "#fbbf24", dot: "rgba(251, 191, 36, 0.5)" };
    return { label: "Critical", color: "#ef4444", dot: "rgba(239, 68, 68, 0.5)" };
  };

  const status = getSystemStatus();

  return (
    <div style={{
      minHeight: "100vh",
      color: "white",
      padding: "0",
      fontFamily: "'Inter', 'Outfit', sans-serif",
    }}>
      {/* ═══════ TOP NAVIGATION BAR ═══════ */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
        padding: "0 32px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
          maxWidth: "1600px",
          margin: "0 auto",
        }}>
          {/* Left: Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(6, 214, 160, 0.15), rgba(56, 189, 248, 0.15))",
              border: "1px solid rgba(6, 214, 160, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}>
              🛡️
            </div>
            <div>
              <h1 style={{
                fontSize: "18px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #f1f5f9, #06d6a0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                lineHeight: "1.2",
                margin: 0,
              }}>
                SentinelOps AI
              </h1>
              <p style={{
                fontSize: "11px",
                color: "#475569",
                fontWeight: "600",
                letterSpacing: "0.04em",
                margin: 0,
              }}>
                INFRASTRUCTURE COMMAND CENTER
              </p>
            </div>
          </div>

          {/* Center: Live clock + status */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "10px",
              background: `${status.color}10`,
              border: `1px solid ${status.color}20`,
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: status.color,
                boxShadow: `0 0 10px ${status.dot}`,
                animation: "pulse-dot 2s infinite",
              }} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: status.color, letterSpacing: "0.04em" }}>
                {status.label.toUpperCase()}
              </span>
            </div>
            <span style={{
              fontSize: "12px",
              color: "#475569",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: "500",
            }}>
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <NotificationCenter notifications={notifications} setNotifications={setNotifications} />

            <ActionButton icon="📄" label="Export" onClick={() =>
              window.open(`http://localhost:5000/api/reports/export-pdf?token=${localStorage.getItem("token")}`, "_blank")
            } />
            <ActionButton icon="🔑" label="API Keys" onClick={() => setShowApiKeyModal(true)} />
            <ActionButton icon="⚙" label="Settings" onClick={() => setShowSettingsModal(true)} />

            <button
              onClick={() => setShowChatDrawer(true)}
              style={{
                background: "linear-gradient(135deg, rgba(6, 214, 160, 0.12), rgba(56, 189, 248, 0.12))",
                border: "1px solid rgba(6, 214, 160, 0.2)",
                color: "#06d6a0",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.25s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.target.style.background = "linear-gradient(135deg, rgba(6, 214, 160, 0.2), rgba(56, 189, 248, 0.2))"; }}
              onMouseLeave={(e) => { e.target.style.background = "linear-gradient(135deg, rgba(6, 214, 160, 0.12), rgba(56, 189, 248, 0.12))"; }}
            >
              💬 AI SRE
            </button>

            <button
              onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                color: "#ef4444",
                padding: "8px 14px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
                fontFamily: "inherit",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.15)"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.08)"; }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════ MAIN CONTENT ═══════ */}
      <main style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "28px 32px 60px",
      }}>
        {/* Anomaly Alert Banner */}
        {anomalies.length > 0 && (
          <div className="glow-danger" style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.04))",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "16px",
            padding: "16px 24px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fade-in-up 0.4s ease both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px", animation: "pulse-icon 1s infinite" }}>🚨</span>
              <div>
                <span style={{ fontWeight: "800", color: "#fca5a5", fontSize: "13px", letterSpacing: "0.04em" }}>
                  ANOMALY DETECTED
                </span>
                <span style={{ color: "#94a3b8", fontSize: "13px", marginLeft: "8px" }}>
                  {anomalies.length} active alert{anomalies.length > 1 ? "s" : ""} — Immediate investigation recommended
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById("ai-anomaly-panel");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#fca5a5",
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "12px",
                letterSpacing: "0.04em",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.25)"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.15)"; }}
            >
              INVESTIGATE →
            </button>
          </div>
        )}

        {/* ═══════ METRICS GRID ═══════ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginBottom: "28px",
        }}>
          <GaugeCard title="CPU Usage" value={metrics ? parseInt(metrics.cpuUsage) : 0} icon="⚡" />
          <GaugeCard title="Memory Usage" value={metrics ? parseInt(metrics.memoryUsagePercentage) : 0} color="#a78bfa" icon="🧠" />

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>🔲</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>CPU Cores</span>
            </div>
            <p style={{ fontSize: "38px", fontWeight: "800", color: "#38bdf8", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em", textShadow: "0 0 20px rgba(56, 189, 248, 0.2)" }}>
              {metrics ? metrics.cpuCores : "—"}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>💾</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Free Memory</span>
            </div>
            <p style={{ fontSize: "38px", fontWeight: "800", color: "#06d6a0", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em", textShadow: "0 0 20px rgba(6, 214, 160, 0.2)" }}>
              {metrics ? `${metrics.freeMemory}` : "—"}
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600", marginLeft: "6px" }}>GB</span>
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>⏱</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Uptime</span>
            </div>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#f1f5f9", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
              {metrics ? metrics.uptime : "—"}
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginLeft: "6px" }}>Hours</span>
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>🖥</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hostname</span>
            </div>
            <p style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#38bdf8",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.02em",
              textShadow: "0 0 12px rgba(56, 189, 248, 0.15)",
              wordBreak: "break-all",
            }}>
              {metrics ? metrics.hostname : "—"}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>⬇</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Download</span>
            </div>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#06d6a0", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", textShadow: "0 0 15px rgba(6, 214, 160, 0.15)" }}>
              {metrics ? metrics.downloadSpeed : "—"}
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginLeft: "6px" }}>MB/s</span>
            </p>
          </div>

          <div className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>⬆</span>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Upload</span>
            </div>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#38bdf8", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", textShadow: "0 0 15px rgba(56, 189, 248, 0.15)" }}>
              {metrics ? metrics.uploadSpeed : "—"}
              <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginLeft: "6px" }}>MB/s</span>
            </p>
          </div>
        </div>

        {/* ═══════ CHARTS ═══════ */}
        <CPUChart data={chartData} forecast={metrics ? metrics.cpuForecast : null} />
        <HistoricalCPUChart data={historicalMetrics} />
        <NetworkChart data={networkChartData} />

        {/* ═══════ INFRASTRUCTURE ═══════ */}
        <MultiServerPanel servers={servers} />
        <DockerPanel containers={containers} />
        <AIAnomalyPanel anomalies={anomalies} hostname={metrics ? metrics.hostname : ""} platform={metrics ? metrics.platform : ""} />
        <AIAnalysisCard aiAnalysis={aiAnalysis} onRunDiagnostic={handleManualDiagnostic} loading={aiLoading} />
        <AutopilotConsole isAutopilotEnabled={isAutopilotEnabled} onToggleAutopilot={handleToggleAutopilot} />

        {/* ═══════ PREDICTIVE INSIGHTS ═══════ */}
        <div className="glass-panel" style={{ padding: "28px", marginTop: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <span style={{ fontSize: "20px" }}>🔮</span>
            <h2 style={{ color: "#f1f5f9", fontSize: "18px", fontWeight: "700", margin: 0, letterSpacing: "-0.01em" }}>
              Predictive AI Insights
            </h2>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#a78bfa",
              background: "rgba(167, 139, 250, 0.1)",
              border: "1px solid rgba(167, 139, 250, 0.2)",
              padding: "3px 8px",
              borderRadius: "6px",
              letterSpacing: "0.05em",
            }}>
              HOLT ML
            </span>
          </div>

          {metrics && metrics.cpuForecast && metrics.cpuForecast.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <PredictiveCard
                label="CPU Load (15s)"
                value={`${metrics.cpuForecast[metrics.cpuForecast.length - 1]}%`}
                trend={metrics.cpuForecast[4] > parseFloat(metrics.cpuUsage) ? "up" : "down"}
                color="#06d6a0"
              />
              <PredictiveCard
                label="Memory Load (15s)"
                value={`${metrics.memForecast ? metrics.memForecast[metrics.memForecast.length - 1] : 0}%`}
                trend={metrics.memForecast && metrics.memForecast[4] > parseFloat(metrics.memoryUsagePercentage) ? "up" : "down"}
                color="#a78bfa"
              />
              <div style={{ gridColumn: "span 2" }}>
                {metrics.memForecast && metrics.memForecast[4] > 90 ? (
                  <div style={{
                    background: "rgba(239, 68, 68, 0.06)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                    <span style={{ fontSize: "18px" }}>⚠️</span>
                    <span style={{ color: "#fca5a5", fontSize: "13px", fontWeight: "600" }}>
                      Memory projected to exceed 90% in 15 seconds. Consider clearing caches or restarting processes.
                    </span>
                  </div>
                ) : metrics.cpuForecast[4] > 80 ? (
                  <div style={{
                    background: "rgba(251, 191, 36, 0.06)",
                    border: "1px solid rgba(251, 191, 36, 0.15)",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                    <span style={{ fontSize: "18px" }}>⚡</span>
                    <span style={{ color: "#fbbf24", fontSize: "13px", fontWeight: "600" }}>
                      CPU load projected to exceed 80% in 15 seconds. High execution load expected.
                    </span>
                  </div>
                ) : (
                  <div style={{
                    background: "rgba(6, 214, 160, 0.06)",
                    border: "1px solid rgba(6, 214, 160, 0.15)",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                    <span style={{ fontSize: "18px" }}>✅</span>
                    <span style={{ color: "#06d6a0", fontSize: "13px", fontWeight: "600" }}>
                      All systems nominal. CPU and Memory projected to remain within safe baselines.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}>
              <svg width="16" height="16" viewBox="0 0 50 50" style={{ animation: "spin-slow 2s linear infinite" }}>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="31.4 94.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>Collecting telemetry for Holt-Winters trend analysis...</span>
            </div>
          )}
        </div>

        <AIIncidentSummary incidents={incidents} />
        <IncidentHistory incidents={incidents} />
        <LogsConsole logs={logs} />
      </main>

      {/* ═══════ MODALS ═══════ */}
      {showSettingsModal && (
        <ModalOverlay onClose={() => setShowSettingsModal(false)}>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "700", color: "#f1f5f9" }}>⚙ Webhook Integrations</h2>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>Configure real-time alerts for Slack and Discord</p>

          <ModalInput label="Slack Webhook URL" placeholder="https://hooks.slack.com/services/..." value={slackUrl} onChange={setSlackUrl} />
          <ModalInput label="Discord Webhook URL" placeholder="https://discord.com/api/webhooks/..." value={discordUrl} onChange={setDiscordUrl} />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <ModalButton label="Cancel" onClick={() => setShowSettingsModal(false)} />
            <ModalButton label="Save Settings" primary onClick={updateIntegrations} />
          </div>
        </ModalOverlay>
      )}

      {showApiKeyModal && (
        <ModalOverlay onClose={() => setShowApiKeyModal(false)}>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "700", color: "#f1f5f9" }}>🔑 Agent API Keys</h2>
          <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>Authenticate remote monitoring agents</p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Key description (e.g. Production VM)"
              value={newKeyDesc}
              onChange={(e) => setNewKeyDesc(e.target.value)}
              style={inputStyle}
            />
            <ModalButton label="Generate" primary onClick={generateApiKey} />
          </div>

          <div style={{ maxHeight: "280px", overflowY: "auto" }}>
            {apiKeys.length === 0 ? (
              <p style={{ color: "#475569", textAlign: "center", padding: "24px", fontSize: "13px" }}>No API Keys generated yet.</p>
            ) : (
              apiKeys.map((key) => (
                <div key={key._id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.02)",
                  marginBottom: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: "700",
                      color: "#38bdf8",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}>
                      {key.key}
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                      {key.description} • {new Date(key.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={() => deleteApiKey(key._id)} style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "700",
                    marginLeft: "12px",
                    fontFamily: "inherit",
                  }}>
                    Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </ModalOverlay>
      )}

      {/* ═══════ CHAT DRAWER ═══════ */}
      {showChatDrawer && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "440px",
          height: "100vh",
          background: "rgba(10, 15, 30, 0.97)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "-20px 0 60px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1001,
          animation: "slide-in-drawer 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}>
          <div style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <div>
                <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: "15px", fontWeight: "700" }}>AI SRE Assistant</h3>
                <p style={{ margin: 0, fontSize: "11px", color: "#475569", fontWeight: "500" }}>Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setShowChatDrawer(false)} style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              color: "#64748b",
              fontSize: "18px",
              cursor: "pointer",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>×</button>
          </div>

          <div style={{
            flex: 1,
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background: msg.sender === "user"
                  ? "linear-gradient(135deg, #06d6a0, #38bdf8)"
                  : "rgba(255, 255, 255, 0.04)",
                color: msg.sender === "user" ? "#030712" : "#cbd5e1",
                padding: "12px 16px",
                borderRadius: msg.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                maxWidth: "85%",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                fontSize: "13px",
                lineHeight: "1.6",
                fontWeight: msg.sender === "user" ? "600" : "400",
                boxShadow: msg.sender === "user" ? "0 4px 16px rgba(6, 214, 160, 0.15)" : "none",
                border: msg.sender === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.04)",
              }}>
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{
                alignSelf: "flex-start",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                padding: "14px 18px",
                borderRadius: "16px 16px 16px 4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#38bdf8",
                      animation: `typing-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
                <span style={{ color: "#475569", fontSize: "12px", fontWeight: "500" }}>Analyzing...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{
            padding: "18px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
            display: "flex",
            gap: "10px",
          }}>
            <input
              type="text"
              placeholder="Ask about your infrastructure..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              style={{
                ...inputStyle,
                flex: 1,
              }}
            />
            <button type="submit" style={{
              background: "linear-gradient(135deg, #06d6a0, #38bdf8)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 18px",
              color: "#030712",
              fontWeight: "800",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
            }}>
              Send
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes pulse-icon { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-drawer { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

/* ═══════ HELPER COMPONENTS ═══════ */

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "rgba(255, 255, 255, 0.04)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      color: "#94a3b8",
      padding: "8px 14px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      transition: "all 0.25s ease",
      fontFamily: "inherit",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)"; }}
  >
    <span style={{ fontSize: "14px" }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const PredictiveCard = ({ label, value, trend, color }) => (
  <div style={{
    background: `${color}08`,
    border: `1px solid ${color}15`,
    borderRadius: "14px",
    padding: "20px",
  }}>
    <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
      {label}
    </p>
    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
      <span style={{ fontSize: "32px", fontWeight: "800", color, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <span style={{ fontSize: "16px", color: trend === "up" ? "#ef4444" : "#06d6a0" }}>
        {trend === "up" ? "📈" : "📉"}
      </span>
    </div>
  </div>
);

const ModalOverlay = ({ children, onClose }) => (
  <div
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(8px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      animation: "fade-in 0.2s ease both",
    }}
  >
    <div style={{
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(20px)",
      padding: "32px",
      borderRadius: "24px",
      width: "100%",
      maxWidth: "560px",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5)",
      animation: "fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: "15%",
        right: "15%",
        height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), transparent)",
        borderRadius: "0 0 2px 2px",
      }} />
      {children}
    </div>
  </div>
);

const ModalInput = ({ label, placeholder, value, onChange }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
      {label}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
    />
  </div>
);

const ModalButton = ({ label, onClick, primary }) => (
  <button
    onClick={onClick}
    style={{
      background: primary ? "linear-gradient(135deg, #06d6a0, #38bdf8)" : "rgba(255, 255, 255, 0.04)",
      border: primary ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
      color: primary ? "#030712" : "#94a3b8",
      padding: "10px 20px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "700",
      fontSize: "13px",
      fontFamily: "inherit",
      transition: "all 0.2s ease",
      boxShadow: primary ? "0 4px 12px rgba(6, 214, 160, 0.15)" : "none",
    }}
  >
    {label}
  </button>
);

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  background: "rgba(0, 0, 0, 0.2)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "all 0.3s ease",
  boxSizing: "border-box",
};

export default Dashboard;
