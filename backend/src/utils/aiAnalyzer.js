const { generateContentWithFallback } = require("./geminiHelper");

// Rules-based fallback function
const getRulesBasedAnalysis = (metrics) => {
  let analysis = "System operating normally.";
  let recommendation = "Continue monitoring.";
  let confidence = 85;

  const cpu = parseInt(metrics.cpuUsage) || 0;
  const memory = parseInt(metrics.memoryUsagePercentage) || 0;
  const network = parseFloat(metrics.downloadSpeed) || 0;

  if (cpu > 85 && memory > 85) {
    analysis = "Resource exhaustion detected. CPU and Memory are simultaneously under heavy load.";
    recommendation = "Investigate running processes, memory leaks, and consider scaling resources.";
    confidence = 96;
  } else if (memory > 90) {
    analysis = "Memory pressure detected. Applications may be consuming excessive RAM.";
    recommendation = "Check memory-intensive services and restart leaking applications.";
    confidence = 93;
  } else if (cpu > 85) {
    analysis = "High CPU utilization detected. Processing load is unusually high.";
    recommendation = "Inspect active processes and optimize workloads.";
    confidence = 91;
  } else if (network > 20) {
    analysis = "Unusual network activity detected.";
    recommendation = "Review inbound/outbound traffic and verify no unexpected transfers.";
    confidence = 88;
  }

  return { analysis, recommendation, confidence };
};

// Simple in-memory cache to save API usage
let cachedAnalysis = null;
let lastAnalysisTime = 0;
let lastAnomalyFingerprint = "";

const analyzeMetrics = async (metrics, anomalies = [], force = false) => {
  // If there are no anomalies and not forced, return static normal analysis without wasting API tokens
  if (anomalies.length === 0 && !force) {
    return {
      analysis: "System operating normally.",
      recommendation: "Continue monitoring.",
      confidence: 100,
    };
  }

  // Create a fingerprint of active anomalies
  const anomalyFingerprint = anomalies.map(a => `${a.type}:${a.severity}`).join(",");
  const now = Date.now();

  // If anomalies are the same and we analyzed within the last 30 seconds, return cache
  if (
    !force &&
    cachedAnalysis && 
    anomalyFingerprint === lastAnomalyFingerprint && 
    (now - lastAnalysisTime < 30000)
  ) {
    return cachedAnalysis;
  }


  // Fallback to rules-based logic if GEMINI_API_KEY is not defined
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not configured. Falling back to rules-based analysis.");
    return getRulesBasedAnalysis(metrics);
  }

  try {
    const prompt = `
      You are an expert Site Reliability Engineer (SRE). Analyze the current server performance metrics, process lists, and anomalies to diagnose the system state.
      
      Telemetry Metrics:
      - Hostname: ${metrics.hostname}
      - Platform: ${metrics.platform} (${metrics.architecture})
      - CPU Usage: ${metrics.cpuUsage} (${metrics.cpuCores} cores)
      - Memory: ${metrics.usedMemory} GB used of ${metrics.totalMemory} GB (${metrics.memoryUsagePercentage}% used)
      - Free Memory: ${metrics.freeMemory} GB
      - Network: Download ${metrics.downloadSpeed} MB/s, Upload ${metrics.uploadSpeed} MB/s
      - Uptime: ${metrics.uptime} Hours
      
      Active Anomalies:
      ${JSON.stringify(anomalies, null, 2)}
      
      Top Running Processes:
      ${JSON.stringify(metrics.processes, null, 2)}
      
      Provide:
      1. A summary of the system state (analysis)
      2. Potential root causes & remediation steps (recommendation)
      3. An overall confidence score (0-100) on your diagnosis (confidence)
      
      Your response must strictly be a JSON object with keys: "analysis", "recommendation", and "confidence".
    `;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            analysis: { type: "STRING" },
            recommendation: { type: "STRING" },
            confidence: { type: "INTEGER" }
          },
          required: ["analysis", "recommendation", "confidence"]
        }
      }
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text);
      cachedAnalysis = parsed;
      lastAnalysisTime = now;
      lastAnomalyFingerprint = anomalyFingerprint;
      return parsed;
    }

    return getRulesBasedAnalysis(metrics);
  } catch (error) {
    console.error("Gemini API error, falling back to rules:", error.message);
    return getRulesBasedAnalysis(metrics);
  }
};

module.exports = {
  analyzeMetrics,
};