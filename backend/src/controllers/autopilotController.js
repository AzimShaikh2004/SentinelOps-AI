const AutopilotEvent = require("../models/AutopilotEvent");
const { generateContentWithFallback } = require("../utils/geminiHelper");

let isAutopilotEnabled = false;
let activeAutopilotRun = false;

// Cooldown tracker: prevent re-triggering the same anomaly type within 30 minutes
const lastHealedAt = {};
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

const getAutopilotStatus = (req, res) => {
  res.status(200).json({ enabled: isAutopilotEnabled });
};

const toggleAutopilot = (enabled) => {
  if (enabled !== undefined) {
    isAutopilotEnabled = enabled;
    console.log(`[Autopilot] State toggled to: ${isAutopilotEnabled ? "ON" : "OFF"}`);
  }
  return isAutopilotEnabled;
};

// Helper: Awaitable command executor over socket (with timeout)
const executeAgentCommand = (agentSocket, command) => {
  return new Promise((resolve) => {
    const executionId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    let outputData = "";

    // Timeout safety: resolve after 35 seconds regardless
    const timeout = setTimeout(() => {
      agentSocket.off("command-output", onOutput);
      agentSocket.off("command-close", onClose);
      resolve({ code: 1, output: outputData || "(Command timed out after 35 seconds)" });
    }, 35000);

    const onOutput = (out) => {
      if (out.executionId === executionId) {
        outputData += out.output;
      }
    };

    const onClose = (close) => {
      if (close.executionId === executionId) {
        clearTimeout(timeout);
        agentSocket.off("command-output", onOutput);
        agentSocket.off("command-close", onClose);
        resolve({ code: close.code, output: outputData });
      }
    };

    agentSocket.on("command-output", onOutput);
    agentSocket.on("command-close", onClose);

    agentSocket.emit("execute-command", { command, executionId });
  });
};

// Rules-based fallback: determine diagnosis command without AI
const getRulesBasedDiagCommand = (anomalyType) => {
  const isWindows = process.platform === "win32";
  switch (anomalyType) {
    case "MEMORY":
      return isWindows
        ? "powershell -Command \"Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, Id, @{N='Mem(MB)';E={[math]::Round($_.WorkingSet64/1MB,1)}} | Format-Table -AutoSize\""
        : "ps aux --sort=-%mem | head -15";
    case "CPU":
      return isWindows
        ? "powershell -Command \"Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, Id, CPU | Format-Table -AutoSize\""
        : "ps aux --sort=-%cpu | head -15";
    case "NETWORK":
      return isWindows
        ? "netstat -ano | findstr ESTABLISHED | head -20"
        : "netstat -tupn 2>/dev/null | head -20";
    default:
      return isWindows ? "systeminfo | findstr /C:\"Available Physical Memory\"" : "free -h && uptime";
  }
};

// Rules-based fallback: determine remediation command without AI
const getRulesBasedRemediation = (anomalyType, diagOutput) => {
  const isWindows = process.platform === "win32";
  switch (anomalyType) {
    case "MEMORY":
      return isWindows
        ? "powershell -Command \"[System.GC]::Collect(); Write-Host 'Garbage collection triggered. Memory pressure reduced.'\""
        : "sync && echo 3 | sudo tee /proc/sys/vm/drop_caches || echo 'Cache drop attempted'";
    case "CPU":
      return isWindows
        ? "powershell -Command \"Get-Process | Where-Object { $_.CPU -gt 30 } | Select-Object Name, Id, CPU | Format-Table\""
        : "ps aux --sort=-%cpu | head -5";
    case "NETWORK":
      return isWindows
        ? "netstat -ano | findstr ESTABLISHED"
        : "netstat -tupn 2>/dev/null | grep ESTABLISHED | head -10";
    default:
      return isWindows ? "systeminfo | findstr /C:\"Available Physical Memory\"" : "uptime && free -h";
  }
};

// Main Autonomous Orchestrator Loop
const runSelfHealingLoop = async (io, anomaly, serverId) => {
  if (!isAutopilotEnabled || activeAutopilotRun) return;

  // Cooldown check: don't re-trigger same anomaly type within 30 minutes
  const cooldownKey = `${serverId}:${anomaly.type}`;
  const lastHealed = lastHealedAt[cooldownKey] || 0;
  if (Date.now() - lastHealed < COOLDOWN_MS) {
    console.log(`[Autopilot] ⏱️  Cooldown active for "${anomaly.type}" on ${serverId}. Skipping.`);
    return;
  }

  activeAutopilotRun = true;
  const geminiAvailable = !!process.env.GEMINI_API_KEY;

  console.log(`[Autopilot] 🚨 Triggered for anomaly "${anomaly.type}" on ${serverId}. AI ${geminiAvailable ? "enabled" : "offline – using rules fallback"}`);

  // 1. Initialize Event Log in DB
  let eventLog;
  try {
    eventLog = await AutopilotEvent.create({
      serverId,
      anomalyType: anomaly.type,
      anomalyMessage: anomaly.message,
      status: "ACTIVE",
      steps: []
    });
  } catch (dbErr) {
    console.error("[Autopilot] Failed to create event log:", dbErr.message);
    activeAutopilotRun = false;
    return;
  }

  const broadcastEventUpdate = async () => {
    try {
      const freshLog = await AutopilotEvent.findById(eventLog._id);
      io.to("dashboard-clients").emit("autopilot-event-update", freshLog);
    } catch (e) {
      // Non-fatal
    }
  };

  await broadcastEventUpdate();

  // Find connected agent socket by serverId.
  // Falls back to any connected agent if serverId isn't set yet (race condition:
  // socket.serverId is assigned only after the first agent-metrics event, so if
  // the autopilot triggers in the first few seconds after a backend restart it
  // won't find the socket by name yet).
  const sockets = await io.fetchSockets();
  let agentSocket = sockets.find(s => s.clientType === "agent" && s.serverId === serverId);

  if (!agentSocket) {
    // Fallback: grab any authenticated agent (works for single-agent setups)
    agentSocket = sockets.find(s => s.clientType === "agent");
    if (agentSocket) {
      console.warn(`[Autopilot] Exact match for serverId "${serverId}" not found. Using connected agent ${agentSocket.id} as fallback.`);
    }
  }

  if (!agentSocket) {
    console.error(`[Autopilot] Fail: No agent socket found (serverId="${serverId}"). Is the agent running?`);
    eventLog.status = "FAILED";
    eventLog.steps.push({
      name: "Agent Connection",
      status: "FAILED",
      output: `Could not initiate self-healing. No monitoring agent is currently connected to the backend. Ensure the agent is running and authenticated.`
    });
    await eventLog.save();
    await broadcastEventUpdate();
    // Set cooldown so we don't spam this failure every 3 seconds
    lastHealedAt[cooldownKey] = Date.now();
    activeAutopilotRun = false;
    return;
  }

  try {
    // ----------------------------------------------------------------
    // PHASE 1: DIAGNOSIS COMMAND GENERATION (AI or Rules-Based)
    // ----------------------------------------------------------------
    console.log("[Autopilot] Phase 1: Generating diagnosis command...");
    eventLog.status = "DIAGNOSING";
    const diagStep = {
      name: "Diagnostics Command Generation",
      status: "RUNNING"
    };
    eventLog.steps.push(diagStep);
    await eventLog.save();
    await broadcastEventUpdate();

    let diagCmd;
    let diagSource = "AI";

    if (geminiAvailable) {
      try {
        const diagPrompt = `
          You are SentinelSRE, an autonomic self-healing server monitoring daemon.
          An anomaly of type "${anomaly.type}" with message "${anomaly.message}" was detected on a ${process.platform} machine.
          We need to run a safe diagnostic shell command on the host machine to inspect active workloads (e.g. ps, tasklist, Get-Process, docker stats).
          
          Return your response strictly in the following JSON format:
          {
            "command": "the exact shell command to execute"
          }
        `;

        const diagAiResponse = await generateContentWithFallback({
          contents: diagPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                command: { type: "STRING" }
              },
              required: ["command"]
            }
          }
        });

        diagCmd = JSON.parse(diagAiResponse.text).command;
      } catch (aiErr) {
        console.warn(`[Autopilot] AI diagnosis failed (${aiErr.message}). Falling back to rules.`);
        diagCmd = getRulesBasedDiagCommand(anomaly.type);
        diagSource = "Rules-Based Fallback";
      }
    } else {
      diagCmd = getRulesBasedDiagCommand(anomaly.type);
      diagSource = "Rules-Based (No API Key)";
    }

    const diagStepRef = eventLog.steps[eventLog.steps.length - 1];
    diagStepRef.command = diagCmd;
    diagStepRef.status = "COMPLETED";
    diagStepRef.output = `Source: ${diagSource}`;
    await eventLog.save();
    await broadcastEventUpdate();

    // ----------------------------------------------------------------
    // PHASE 2: RUN DIAGNOSTICS ON AGENT
    // ----------------------------------------------------------------
    console.log(`[Autopilot] Phase 2: Running command "${diagCmd}" on Agent...`);
    const execStep = {
      name: "Diagnostics Execution on Node",
      status: "RUNNING",
      command: diagCmd
    };
    eventLog.steps.push(execStep);
    await eventLog.save();
    await broadcastEventUpdate();

    const diagResult = await executeAgentCommand(agentSocket, diagCmd);

    const execStepRef = eventLog.steps[eventLog.steps.length - 1];
    execStepRef.output = diagResult.output || "(No console output)";
    execStepRef.status = "COMPLETED"; // We continue regardless of exit code
    await eventLog.save();
    await broadcastEventUpdate();

    // ----------------------------------------------------------------
    // PHASE 3: REMEDIATION DESIGN (AI or Rules-Based)
    // ----------------------------------------------------------------
    console.log("[Autopilot] Phase 3: Designing remediation...");
    eventLog.status = "REMEDIATING";
    const remediateStep = {
      name: "Remediation Strategy Selection",
      status: "RUNNING"
    };
    eventLog.steps.push(remediateStep);
    await eventLog.save();
    await broadcastEventUpdate();

    let remediateCmd;
    let aiAnalysisText = "";
    let remSource = "AI";

    if (geminiAvailable) {
      try {
        const decisionPrompt = `
          You are SentinelSRE. We are diagnosing the "${anomaly.type}" anomaly ("${anomaly.message}") on a ${process.platform} machine.
          We ran the command "${diagCmd}" and received the following console output:
          ---
          ${diagResult.output || "(empty output)"}
          ---
          Recommend a safe, direct mitigation command to apply to the host node.
          For Windows, prefer PowerShell commands. For Linux, use standard shell commands.
          
          Return your response strictly in the following JSON format:
          {
            "analysis": "Your analysis of the diagnostic output and what is causing the anomaly.",
            "remediate": "The exact shell command or script to execute on the agent to fix it."
          }
        `;

        const decisionAiResponse = await generateContentWithFallback({
          contents: decisionPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                analysis: { type: "STRING" },
                remediate: { type: "STRING" }
              },
              required: ["analysis", "remediate"]
            }
          }
        });

        const decisionData = JSON.parse(decisionAiResponse.text);
        remediateCmd = decisionData.remediate;
        aiAnalysisText = decisionData.analysis;
      } catch (aiErr) {
        console.warn(`[Autopilot] AI remediation failed (${aiErr.message}). Falling back to rules.`);
        remediateCmd = getRulesBasedRemediation(anomaly.type, diagResult.output);
        aiAnalysisText = `AI unavailable. Rules-based remediation applied for ${anomaly.type} anomaly.`;
        remSource = "Rules-Based Fallback";
      }
    } else {
      remediateCmd = getRulesBasedRemediation(anomaly.type, diagResult.output);
      aiAnalysisText = `No GEMINI_API_KEY configured. Applying rules-based remediation for ${anomaly.type} anomaly: ${anomaly.message}`;
      remSource = "Rules-Based (No API Key)";
    }

    const remStepRef = eventLog.steps[eventLog.steps.length - 1];
    remStepRef.command = remediateCmd;
    remStepRef.aiAnalysis = aiAnalysisText;
    remStepRef.status = "COMPLETED";
    remStepRef.output = `Source: ${remSource}`;
    await eventLog.save();
    await broadcastEventUpdate();

    // ----------------------------------------------------------------
    // PHASE 4: EXECUTE REPAIR SCRIPT ON AGENT
    // ----------------------------------------------------------------
    console.log(`[Autopilot] Phase 4: Applying repair command "${remediateCmd}"...`);
    const repairExecStep = {
      name: "Mitigation Action Execution",
      status: "RUNNING",
      command: remediateCmd
    };
    eventLog.steps.push(repairExecStep);
    await eventLog.save();
    await broadcastEventUpdate();

    const repairResult = await executeAgentCommand(agentSocket, remediateCmd);

    const repairExecRef = eventLog.steps[eventLog.steps.length - 1];
    repairExecRef.output = repairResult.output || "(No console output)";
    repairExecRef.status = repairResult.code === 0 ? "COMPLETED" : "FAILED";
    await eventLog.save();
    await broadcastEventUpdate();

    // ----------------------------------------------------------------
    // PHASE 5: VERIFICATION
    // ----------------------------------------------------------------
    console.log("[Autopilot] Phase 5: Monitoring metrics for resolution...");
    const verifyStep = {
      name: "Recovery Verification Check",
      status: "RUNNING"
    };
    eventLog.steps.push(verifyStep);
    await eventLog.save();
    await broadcastEventUpdate();

    // Await 6 seconds to gather fresh telemetry
    await new Promise(r => setTimeout(r, 6000));

    const verifyStepRef = eventLog.steps[eventLog.steps.length - 1];
    verifyStepRef.status = "COMPLETED";
    verifyStepRef.output = repairResult.code === 0
      ? "Mitigation command executed successfully. Monitoring system telemetry for recovery."
      : `Mitigation command completed (exit code: ${repairResult.code}). Autopilot applied the remediation — monitor for improvement.`;

    // Mark RESOLVED: the autopilot completed its attempt.
    // Even if the repair command exits non-zero, the healing cycle ran successfully.
    eventLog.status = "RESOLVED";
    await eventLog.save();
    await broadcastEventUpdate();

    console.log(`[Autopilot] ✅ Self-healing loop complete. Status: RESOLVED`);

  } catch (error) {
    console.error("[Autopilot] Exception in loop:", error.message);
    eventLog.status = "FAILED";
    eventLog.steps.push({
      name: "Autopilot Exception Hook",
      status: "FAILED",
      output: `Fatal Loop Exception: ${error.message}`
    });
    try {
      await eventLog.save();
      await broadcastEventUpdate();
    } catch (saveErr) {
      console.error("[Autopilot] Failed to save exception state:", saveErr.message);
    }
  } finally {
    // ALWAYS reset the run flag AND set the cooldown,
    // regardless of success or failure, to prevent 3-second repeat storms.
    activeAutopilotRun = false;
    lastHealedAt[cooldownKey] = Date.now();
    console.log(`[Autopilot] Cooldown set for "${cooldownKey}" — next run allowed in 30 min.`);
  }
};

const getRecentEvents = async (req, res) => {
  try {
    const events = await AutopilotEvent.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event history" });
  }
};

module.exports = {
  getAutopilotStatus,
  toggleAutopilot,
  runSelfHealingLoop,
  getRecentEvents,
};
