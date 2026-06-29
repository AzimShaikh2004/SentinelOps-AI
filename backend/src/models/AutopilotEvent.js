const mongoose = require("mongoose");

const autopilotStepSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Diagnosis Request", "Command Execution", "Analysis"
  status: { type: String, enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED"], default: "PENDING" },
  command: { type: String },
  output: { type: String },
  aiAnalysis: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const autopilotEventSchema = new mongoose.Schema(
  {
    serverId: { type: String, required: true },
    anomalyType: { type: String, required: true },
    anomalyMessage: { type: String },
    status: { 
      type: String, 
      enum: ["ACTIVE", "DIAGNOSING", "REMEDIATING", "RESOLVED", "FAILED"], 
      default: "ACTIVE" 
    },
    steps: [autopilotStepSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AutopilotEvent", autopilotEventSchema);
