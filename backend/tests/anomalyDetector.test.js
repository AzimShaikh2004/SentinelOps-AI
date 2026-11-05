const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const SystemMetric = require("../src/models/SystemMetric");
const { detectAnomalies } = require("../src/utils/anomalyDetector");

describe("Anomaly Detector — Adaptive Z-Scores & Static Fallbacks", () => {
  const originalFind = SystemMetric.find;

  afterEach(() => {
    SystemMetric.find = originalFind;
  });

  const mockDbHistory = (records) => {
    SystemMetric.find = () => ({
      sort: () => ({
        limit: async () => records,
      }),
    });
  };

  const createMetrics = (cpu = "30", memory = "50", download = "1.5", disk = "45") => ({
    cpuUsage: cpu,
    memoryUsagePercentage: memory,
    downloadSpeed: download,
    diskUsagePercentage: disk,
  });

  test("TC-10: Should return empty array when all metrics are within normal ranges", async () => {
    mockDbHistory([
      { cpuUsage: 30, memoryUsage: 50, downloadSpeed: 1.0 },
      { cpuUsage: 32, memoryUsage: 52, downloadSpeed: 1.1 },
      { cpuUsage: 28, memoryUsage: 48, downloadSpeed: 0.9 },
      { cpuUsage: 31, memoryUsage: 51, downloadSpeed: 1.2 },
      { cpuUsage: 29, memoryUsage: 49, downloadSpeed: 0.8 },
    ]);

    const anomalies = await detectAnomalies(createMetrics("30", "50", "1.0", "45"));
    assert.deepStrictEqual(anomalies, []);
  });

  test("TC-09: Should detect CPU anomaly via static threshold when CPU > 85%", async () => {
    mockDbHistory([]); // No history, triggers static fallback

    const anomalies = await detectAnomalies(createMetrics("92", "50", "1.0", "45"));
    assert.ok(anomalies.length >= 1, "Should detect at least 1 anomaly");
    const cpuAnom = anomalies.find(a => a.type === "CPU");
    assert.ok(cpuAnom, "CPU anomaly should exist");
    assert.strictEqual(cpuAnom.severity, "HIGH");
    assert.strictEqual(cpuAnom.confidence, 94);
  });

  test("Should detect MEMORY anomaly via static threshold when Memory > 85%", async () => {
    mockDbHistory([]);

    const anomalies = await detectAnomalies(createMetrics("30", "94", "1.0", "45"));
    const memAnom = anomalies.find(a => a.type === "MEMORY");
    assert.ok(memAnom, "Memory anomaly should exist");
    assert.strictEqual(memAnom.severity, "HIGH");
    assert.strictEqual(memAnom.confidence, 91);
  });

  test("Should detect NETWORK anomaly when download speed > 20 MB/s", async () => {
    mockDbHistory([]);

    const anomalies = await detectAnomalies(createMetrics("30", "50", "28.5", "45"));
    const netAnom = anomalies.find(a => a.type === "NETWORK");
    assert.ok(netAnom, "Network anomaly should exist");
    assert.strictEqual(netAnom.severity, "MEDIUM");
    assert.strictEqual(netAnom.confidence, 88);
  });

  test("Should detect DISK anomaly when disk usage > 90%", async () => {
    mockDbHistory([]);

    const anomalies = await detectAnomalies(createMetrics("30", "50", "1.0", "95"));
    const diskAnom = anomalies.find(a => a.type === "DISK");
    assert.ok(diskAnom, "Disk anomaly should exist");
    assert.strictEqual(diskAnom.severity, "HIGH");
    assert.strictEqual(diskAnom.confidence, 95);
  });

  test("Should detect warning DISK anomaly when disk usage > 80% and <= 90%", async () => {
    mockDbHistory([]);

    const anomalies = await detectAnomalies(createMetrics("30", "50", "1.0", "84"));
    const diskAnom = anomalies.find(a => a.type === "DISK");
    assert.ok(diskAnom, "Disk anomaly should exist");
    assert.strictEqual(diskAnom.severity, "MEDIUM");
    assert.strictEqual(diskAnom.confidence, 88);
  });

  test("TC-08: Should detect statistical CPU anomaly using Z-Score against rolling baseline", async () => {
    mockDbHistory([
      { cpuUsage: 20 },
      { cpuUsage: 30 },
      { cpuUsage: 20 },
      { cpuUsage: 30 },
      { cpuUsage: 20 },
      { cpuUsage: 30 },
      { cpuUsage: 20 },
      { cpuUsage: 30 },
      { cpuUsage: 20 },
      { cpuUsage: 30 },
    ]);

    // Current CPU is 95%, baseline mean is 25, stdDev is 5, zScore = (95-25)/5 = 14 > 2.5
    const anomalies = await detectAnomalies(createMetrics("95", "50", "1.0", "45"));
    const cpuAnom = anomalies.find(a => a.type === "CPU");
    assert.ok(cpuAnom, "CPU anomaly should exist");
    assert.ok(cpuAnom.message.includes("Z-Score"), "Message should cite Z-Score calculation");
    assert.ok(cpuAnom.confidence >= 94, "Confidence should reflect high statistical variance");
  });

  test("Should gracefully handle database errors during history fetching", async () => {
    SystemMetric.find = () => ({
      sort: () => ({
        limit: async () => {
          throw new Error("Simulated MongoDB connection drop");
        },
      }),
    });

    // Should not throw, should fall back to static thresholds
    const anomalies = await detectAnomalies(createMetrics("92", "50", "1.0", "45"));
    assert.ok(anomalies.length >= 1);
    assert.strictEqual(anomalies[0].type, "CPU");
  });
});
