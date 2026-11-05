const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");
const { analyzeMetrics } = require("../src/utils/aiAnalyzer");

describe("AI Analyzer — SRE Rules Fallback Engine", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY; // Ensure rules engine is triggered
  });

  afterEach(() => {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  const createMetrics = (cpu = "25%", memory = "45", network = "1.2") => ({
    cpuUsage: cpu,
    memoryUsagePercentage: memory,
    downloadSpeed: network,
    hostname: "node-test-01",
    platform: "linux",
    architecture: "x64",
    cpuCores: 8,
    totalMemory: "32.00",
    freeMemory: "18.00",
    usedMemory: "14.00",
    uploadSpeed: "0.5",
    uptime: "72.4",
    processes: [],
  });

  test("TC-13: Should return normal diagnosis when no anomalies are present", async () => {
    const result = await analyzeMetrics(createMetrics(), []);

    assert.strictEqual(result.analysis, "System operating normally.");
    assert.strictEqual(result.recommendation, "Continue monitoring.");
    assert.strictEqual(result.confidence, 100);
  });

  test("Should diagnose simultaneous Resource Exhaustion when CPU > 85% and Memory > 85%", async () => {
    const result = await analyzeMetrics(createMetrics("92%", "89"), [{ type: "CPU", severity: "HIGH" }], true);

    assert.ok(result.analysis.includes("Resource exhaustion"));
    assert.strictEqual(result.confidence, 96);
  });

  test("Should diagnose Memory Pressure when Memory > 90%", async () => {
    const result = await analyzeMetrics(createMetrics("40%", "94"), [{ type: "MEMORY", severity: "HIGH" }], true);

    assert.ok(result.analysis.includes("Memory pressure"));
    assert.strictEqual(result.confidence, 93);
  });

  test("Should diagnose High CPU utilization when CPU > 85% alone", async () => {
    const result = await analyzeMetrics(createMetrics("89%", "50"), [{ type: "CPU", severity: "HIGH" }], true);

    assert.ok(result.analysis.includes("High CPU utilization"));
    assert.strictEqual(result.confidence, 91);
  });

  test("Should diagnose Unusual Network activity when download > 20 MB/s", async () => {
    const result = await analyzeMetrics(createMetrics("30%", "50", "35.5"), [{ type: "NETWORK", severity: "MEDIUM" }], true);

    assert.ok(result.analysis.includes("network activity"));
    assert.strictEqual(result.confidence, 88);
  });
});

