const mongoose = require("mongoose");

const systemMetricSchema = new mongoose.Schema(
  {
    cpuUsage: Number,
    memoryUsage: Number,
    freeMemory: Number,
    cpuCores: Number,
    downloadSpeed: Number,
    uploadSpeed: Number,
    diskUsage: Number,
    hostname: String,
    uptime: Number,
  },
  {
    timestamps: true,
  }
);

// Performance index for time-series queries
systemMetricSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SystemMetric", systemMetricSchema);
