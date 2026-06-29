const mongoose =
  require("mongoose");

const systemMetricSchema =
  new mongoose.Schema(
    {
      cpuUsage: Number,

      memoryUsage: Number,

      freeMemory: Number,

      cpuCores: Number,

      downloadSpeed: Number,

      uploadSpeed: Number,

      hostname: String,

      uptime: Number,
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "SystemMetric",
    systemMetricSchema
  );