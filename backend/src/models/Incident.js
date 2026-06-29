const mongoose = require(
  "mongoose"
);

const incidentSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,

        required: true,
      },

      severity: {
        type: String,

        required: true,
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

module.exports =
  mongoose.model(
    "Incident",
    incidentSchema
  );