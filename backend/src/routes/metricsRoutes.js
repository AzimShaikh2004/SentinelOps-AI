const express =
  require("express");

const router =
  express.Router();

const SystemMetric =
  require(
    "../models/SystemMetric"
  );

const { protect } = require("../middleware/authMiddleware");
const { getSystemMetrics } = require("../services/monitoringService");
const { detectAnomalies } = require("../utils/anomalyDetector");
const { analyzeMetrics } = require("../utils/aiAnalyzer");

router.get(
  "/history",
  async (req, res) => {
    try {
      const metrics =
        await SystemMetric.find()
          .sort({
            createdAt: -1,
          })
          .limit(1440);

      res.json(metrics);
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch metrics",
      });
    }
  }
);

const { generateContentWithFallback } = require("../utils/geminiHelper");

router.post(
  "/ai-analyze",
  protect,
  async (req, res) => {
    try {
      const metrics = await getSystemMetrics();
      const anomalies = await detectAnomalies(metrics);
      const aiAnalysis = await analyzeMetrics(metrics, anomalies, true);
      res.json(aiAnalysis);
    } catch (error) {
      res.status(500).json({
        message: "AI diagnostics failed: " + error.message,
      });
    }
  }
);

router.post(
  "/ai-chat",
  protect,
  async (req, res) => {
    let metrics = null;
    let anomalies = [];
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "Gemini API key is not configured on the backend." });
      }

      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required." });
      }

      metrics = await getSystemMetrics();
      anomalies = await detectAnomalies(metrics);


      const contextPrompt = `
You are "SentinelOps SRE", an elite virtual Site Reliability Engineer. You are helping the system administrator debug and manage their cluster.
Here is the real-time telemetry from their active node:
- Hostname: ${metrics.hostname}
- CPU Usage: ${metrics.cpuUsage} (${metrics.cpuCores} cores)
- Memory: ${metrics.usedMemory} GB used of ${metrics.totalMemory} GB (${metrics.memoryUsagePercentage}% used)
- Free Memory: ${metrics.freeMemory} GB
- Network: Download ${metrics.downloadSpeed} MB/s, Upload ${metrics.uploadSpeed} MB/s
- Uptime: ${metrics.uptime} Hours

Active Anomalies:
${JSON.stringify(anomalies, null, 2)}

Top Processes:
${JSON.stringify(metrics.processes, null, 2)}

Chat history:
${history ? history.map(h => `${h.sender === "user" ? "User" : "SRE"}: ${h.text}`).join("\n") : ""}

User's new question: ${message}

Provide a direct, concise, and helpful SRE response. Use markdown formatting. Be technical and actionable.
      `;

      const response = await generateContentWithFallback({
        contents: contextPrompt,
      });

      res.status(200).json({
        reply: response.text || "I was unable to process your request.",
      });
    } catch (error) {
      console.error("AI Chat error:", error);
      
      let fallbackReply = `⚠️ **Gemini API Error**: I encountered an error communicating with the Gemini API.
      
*Details:* ${error.message}

Please ensure a valid \`GEMINI_API_KEY\` is configured in the backend \`.env\` file.`;

      if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
        fallbackReply = `⚠️ **Invalid API Key**: The \`GEMINI_API_KEY\` configured in the backend \`.env\` file is invalid.
        
To resolve this:
1. Open [Google AI Studio](https://aistudio.google.com/) and obtain a valid Gemini API key.
2. Edit \`backend/.env\` and set \`GEMINI_API_KEY=your_key_here\` (make sure to remove any square brackets or placeholders).
3. Restart the backend.

**Current Server Status (Fallback):**
- **CPU Usage:** ${metrics ? (metrics.cpuUsage.toString().includes('%') ? metrics.cpuUsage : metrics.cpuUsage + "%") : "N/A"}
- **Memory Usage:** ${metrics ? (metrics.memoryUsagePercentage.toString().includes('%') ? metrics.memoryUsagePercentage : metrics.memoryUsagePercentage + "%") : "N/A"}
- **Anomalies Detected:** ${anomalies.length}`;
      }

      res.status(200).json({
        reply: fallbackReply,
      });
    }
  }
);

router.post(
  "/ai-remediation",
  protect,
  async (req, res) => {
    try {
      const { anomalyType, anomalyMessage, hostname, platform } = req.body;
      if (!anomalyType) {
        return res.status(400).json({ message: "Anomaly type is required." });
      }

      const prompt = `
        You are an expert Site Reliability Engineer (SRE).
        Generate safe diagnostic shell commands and remediation advice to resolve the following server anomaly:
        - Anomaly Type: ${anomalyType}
        - Description: ${anomalyMessage}
        - Hostname: ${hostname || "N/A"}
        - Platform: ${platform || "N/A"}

        Provide your response strictly in the following JSON format:
        {
          "diagnose": "A list of 2-3 safe command-line instructions (e.g. systemctl status, top, df -h) to diagnose or inspect the resource usage or root cause.",
          "remediate": "A safe shell command, CLI tool execution, service restart command, or brief script to mitigate or fix the specific anomaly.",
          "notes": "A brief technical warning, best practice caution, or configuration note regarding the mitigation steps."
        }
      `;

      const response = await generateContentWithFallback({
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              diagnose: { type: "STRING" },
              remediate: { type: "STRING" },
              notes: { type: "STRING" }
            },
            required: ["diagnose", "remediate", "notes"]
          }
        }
      });

      if (response && response.text) {
        return res.status(200).json(JSON.parse(response.text));
      }

      throw new Error("Unable to retrieve AI remediation advice.");
    } catch (error) {
      console.error("AI Remediation failed:", error);
      res.status(200).json({
        diagnose: `# Local diagnostic suggestion\n# Inspect resource usage:\ntop -b -n 1 | head -n 20`,
        remediate: `# Local mitigation suggestion\n# Check system alerts and consider restarting heavy processes.`,
        notes: `⚠️ **AI Fallback**: Gemini API is currently unavailable (Details: ${error.message}). Showing rules-based local suggestions.`
      });
    }
  }
);

module.exports = router;
