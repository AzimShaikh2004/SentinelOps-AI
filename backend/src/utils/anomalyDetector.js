const SystemMetric = require("../models/SystemMetric");

/**
 * Adaptive Anomaly Detector using Statistical Z-Scores
 * Evaluates current metrics against the rolling mean and standard deviation of historical data.
 */
const detectAnomalies = async (metrics) => {
  const anomalies = [];

  const cpu = parseInt(metrics.cpuUsage) || 0;
  const memory = parseInt(metrics.memoryUsagePercentage) || 0;
  const download = parseFloat(metrics.downloadSpeed) || 0;

  // Fetch recent metrics history (up to last 30 entries)
  let history = [];
  try {
    history = await SystemMetric.find()
      .sort({ createdAt: -1 })
      .limit(30);
  } catch (err) {
    console.error("[AnomalyDetector] Error fetching metric history:", err.message);
  }

  // Helper to compute mean and standard deviation
  const getStats = (values) => {
    if (values.length < 5) return null; // Need at least 5 points for a reliable baseline
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length
    );
    return { mean, stdDev };
  };

  // 1. CPU Anomaly (rolling baseline or hard limit threshold)
  let cpuAnom = false;
  let cpuConfidence = 94;
  let cpuMsg = "Abnormal CPU spike detected";

  if (history.length >= 5) {
    const cpuHistory = history.map(h => h.cpuUsage).filter(x => x !== undefined && !isNaN(x));
    const stats = getStats(cpuHistory);
    if (stats && stats.stdDev > 2) {
      const zScore = (cpu - stats.mean) / stats.stdDev;
      if (zScore > 2.5) { // 2.5 standard deviations above recent baseline
        cpuAnom = true;
        cpuMsg = `Statistical CPU anomaly detected (Z-Score: ${zScore.toFixed(1)}). Current usage (${cpu}%) is significantly higher than the rolling baseline average of ${stats.mean.toFixed(1)}%.`;
        cpuConfidence = Math.min(99, Math.round(90 + zScore * 2));
      }
    }
  }

  // Fallback to static threshold
  if (!cpuAnom && cpu > 85) {
    cpuAnom = true;
    cpuMsg = `Abnormal CPU spike detected (current load ${cpu}% exceeds threshold limit of 85%)`;
    cpuConfidence = 94;
  }

  if (cpuAnom) {
    anomalies.push({
      type: "CPU",
      severity: "HIGH",
      message: cpuMsg,
      aiAnalysis: "AI SRE detected unusually high CPU load. This may be caused by infinite loops in user applications, database index locks, or background batch processing.",
      recommendation: "Inspect high CPU tasks using diagnostic commands, check application logs, or scale computational cores.",
      confidence: cpuConfidence,
      time: new Date().toLocaleTimeString(),
    });
  }

  // 2. Memory Anomaly (rolling baseline or hard limit threshold)
  let memAnom = false;
  let memConfidence = 91;
  let memMsg = "Critical memory usage detected";

  if (history.length >= 5) {
    const memHistory = history.map(h => h.memoryUsage).filter(x => x !== undefined && !isNaN(x));
    const stats = getStats(memHistory);
    if (stats && stats.stdDev > 1) {
      const zScore = (memory - stats.mean) / stats.stdDev;
      if (zScore > 2.5) {
        memAnom = true;
        memMsg = `Statistical Memory anomaly detected (Z-Score: ${zScore.toFixed(1)}). Memory usage (${memory}%) deviates sharply from the rolling baseline average of ${stats.mean.toFixed(1)}%.`;
        memConfidence = Math.min(99, Math.round(88 + zScore * 2));
      }
    }
  }

  // Fallback to static threshold
  if (!memAnom && memory > 85) {
    memAnom = true;
    memMsg = `Critical memory usage detected (current consumption ${memory}% exceeds limit of 85%)`;
    memConfidence = 91;
  }

  if (memAnom) {
    anomalies.push({
      type: "MEMORY",
      severity: "HIGH",
      message: memMsg,
      aiAnalysis: "Memory pressure has reached critical thresholds, indicating memory leaks, large heap footprints, or insufficient physical system RAM.",
      recommendation: "Identify memory-intensive processes and consider restarting leaking containers or clearing process swap caches.",
      confidence: memConfidence,
      time: new Date().toLocaleTimeString(),
    });
  }

  // 3. Network Anomaly (rolling baseline or hard limit threshold)
  let netAnom = false;
  let netConfidence = 88;
  let netMsg = "Unusual network traffic detected";

  if (history.length >= 5) {
    const netHistory = history.map(h => h.downloadSpeed).filter(x => x !== undefined && !isNaN(x));
    const stats = getStats(netHistory);
    if (stats && stats.stdDev > 0.5) {
      const zScore = (download - stats.mean) / stats.stdDev;
      if (zScore > 3.0) { // Require higher standard deviation deviations for network
        netAnom = true;
        netMsg = `Statistical Network download anomaly detected (Z-Score: ${zScore.toFixed(1)}). Bandwidth is ${download.toFixed(1)} MB/s compared to recent baseline mean of ${stats.mean.toFixed(1)} MB/s.`;
        netConfidence = Math.min(99, Math.round(85 + zScore * 2));
      }
    }
  }

  // Fallback to static threshold
  if (!netAnom && download > 20) {
    netAnom = true;
    netMsg = `Unusual network traffic detected (current speed ${download} MB/s exceeds threshold of 20 MB/s)`;
    netConfidence = 88;
  }

  if (netAnom) {
    anomalies.push({
      type: "NETWORK",
      severity: "MEDIUM",
      message: netMsg,
      aiAnalysis: "Incoming network traffic is statistically higher than normal baseline patterns, hinting at file transfers, large updates, or potential DDoS connections.",
      recommendation: "Review current network connection states, check active socket connections, and audit web server ingress logs.",
      confidence: netConfidence,
      time: new Date().toLocaleTimeString(),
    });
  }

  return anomalies;
};

module.exports = {
  detectAnomalies,
};