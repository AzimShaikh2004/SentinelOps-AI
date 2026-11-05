const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["CPU", "MEMORY", "NETWORK", "DISK", "SERVER_OFFLINE"],
    },

    severity: {
      type: String,
      required: true,
      enum: ["HIGH", "MEDIUM", "LOW"],
    },

    message: {
      type: String,
      required: true,
    },

    server: {
      type: String,
      default: "Local",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes for deduplication queries and time-series reads
incidentSchema.index({ createdAt: -1 });
incidentSchema.index({ message: 1, createdAt: -1 });

module.exports = mongoose.model("Incident", incidentSchema);
