import React, { useState, useEffect, useRef } from "react";
import socket from "../socket/socket";
import { toast } from "react-toastify";

const TerminalConsole = ({ command: initialCommand, serverId, onClose }) => {
  const [command, setCommand] = useState(initialCommand || "");
  const [output, setOutput] = useState([
    { text: `System terminal initialized for server [${serverId}]`, type: "system" },
    { text: `Ready to run safe diagnostics. Type a command or click execute.`, type: "system" }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionId, setExecutionId] = useState(null);
  
  const bottomRef = useRef(null);

  // Auto Scroll to Bottom of Terminal
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  // Hook into WebSocket updates
  useEffect(() => {
    const handleOutput = (data) => {
      if (data.executionId === executionId) {
        setOutput((prev) => [...prev, { text: data.output, type: data.type }]);
      }
    };

    const handleClose = (data) => {
      if (data.executionId === executionId) {
        setOutput((prev) => [
          ...prev, 
          { text: `\nProcess completed with exit code: ${data.code}`, type: "system" }
        ]);
        setIsRunning(false);
        setExecutionId(null);
      }
    };

    const handleError = (data) => {
      if (data.executionId === executionId) {
        setOutput((prev) => [
          ...prev, 
          { text: `\nRemote Execution Error: ${data.error}`, type: "stderr" }
        ]);
        setIsRunning(false);
        setExecutionId(null);
      }
    };

    socket.on("command-output", handleOutput);
    socket.on("command-close", handleClose);
    socket.on("command-error", handleError);

    return () => {
      socket.off("command-output", handleOutput);
      socket.off("command-close", handleClose);
      socket.off("command-error", handleError);
    };
  }, [executionId]);

  const handleExecute = (cmdToRun = command) => {
    if (!cmdToRun.trim() || isRunning) return;

    const newExecId = `exec-${Date.now()}`;
    setExecutionId(newExecId);
    setIsRunning(true);
    
    setOutput((prev) => [
      ...prev,
      { text: `\n$ ${cmdToRun}`, type: "prompt" }
    ]);

    socket.emit("execute-command", {
      command: cmdToRun,
      serverId: serverId || "Laptop-1",
      executionId: newExecId
    });
  };

  const handleClear = () => {
    setOutput([
      { text: `Console cleared. Target server: [${serverId || "Laptop-1"}]`, type: "system" }
    ]);
  };

  return (
    <div style={terminalOverlayStyle}>
      <div style={terminalContentStyle} className="glass-panel">
        {/* Terminal Header */}
        <div style={terminalHeaderStyle}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <div style={{ ...dotStyle, background: "#ef4444" }} onClick={onClose}></div>
            <div style={{ ...dotStyle, background: "#f59e0b" }}></div>
            <div style={{ ...dotStyle, background: "#10b981" }}></div>
            <span style={titleStyle}>SentinelSRE Terminal @ {serverId || "localhost"}</span>
          </div>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        {/* Log Viewer */}
        <div style={logViewerStyle}>
          {output.map((line, index) => (
            <pre key={index} style={getLineStyle(line.type)}>
              {line.text}
            </pre>
          ))}
          {isRunning && (
            <div style={typingIndicatorStyle}>
              <span className="cursor-blink">█</span> Running...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Controls */}
        <div style={inputContainerStyle}>
          <span style={{ color: "#38bdf8", marginRight: "10px", fontFamily: "monospace", fontSize: "14px", fontWeight: "bold" }}>$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecute()}
            disabled={isRunning}
            placeholder="Type diagnostic command (e.g. dir, netstat, tasklist)..."
            style={terminalInputStyle}
          />
          <button 
            onClick={() => handleExecute()}
            disabled={isRunning || !command.trim()}
            style={executeButtonStyle(isRunning || !command.trim())}
          >
            {isRunning ? "Running..." : "Run"}
          </button>
          <button onClick={handleClear} style={clearButtonStyle}>
            Clear
          </button>
        </div>
      </div>
      <style>{`
        .cursor-blink {
          animation: blink 1s step-end infinite;
          color: #10b981;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const terminalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.82)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1200,
};

const terminalContentStyle = {
  background: "#020617",
  border: "1px solid rgba(56, 189, 248, 0.25)",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "800px",
  height: "550px",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 25px 50px -12px rgba(56, 189, 248, 0.15)",
  overflow: "hidden",
};

const terminalHeaderStyle = {
  background: "rgba(15, 23, 42, 0.9)",
  padding: "12px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const dotStyle = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  cursor: "pointer",
};

const titleStyle = {
  color: "#94a3b8",
  fontSize: "13px",
  marginLeft: "12px",
  fontFamily: "monospace",
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  color: "#64748b",
  fontSize: "22px",
  cursor: "pointer",
};

const logViewerStyle = {
  flex: 1,
  background: "#010409",
  padding: "20px",
  overflowY: "auto",
  fontFamily: "Courier New, monospace",
  fontSize: "14px",
  lineHeight: "1.6",
};

const inputContainerStyle = {
  padding: "15px 20px",
  background: "rgba(15, 23, 42, 0.8)",
  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const terminalInputStyle = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "#f8fafc",
  fontFamily: "monospace",
  fontSize: "14px",
};

const executeButtonStyle = (disabled) => ({
  background: disabled ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.9)",
  border: "none",
  color: disabled ? "#64748b" : "white",
  padding: "8px 16px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: disabled ? "not-allowed" : "pointer",
  transition: "all 0.2s ease",
});

const clearButtonStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#94a3b8",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const typingIndicatorStyle = {
  color: "#38bdf8",
  marginTop: "10px",
  fontSize: "14px",
};

const getLineStyle = (type) => {
  const base = {
    margin: 0,
    padding: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    fontFamily: "Courier New, monospace",
  };

  switch (type) {
    case "stderr":
      return { ...base, color: "#ef4444" }; // Red
    case "prompt":
      return { ...base, color: "#38bdf8", fontWeight: "bold" }; // Light Blue
    case "system":
      return { ...base, color: "#94a3b8", fontStyle: "italic" }; // Gray
    case "stdout":
    default:
      return { ...base, color: "#10b981" }; // Green
  }
};

export default TerminalConsole;
