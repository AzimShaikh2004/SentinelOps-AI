const User = require("../models/User");
const axios = require("axios");

const sendAlert = async (anomaly) => {
  try {
    const users = await User.find({
      $or: [
        { slackWebhookUrl: { $ne: "" } },
        { discordWebhookUrl: { $ne: "" } }
      ]
    });

    if (users.length === 0) return;

    for (const user of users) {
      // Send Slack Alert
      if (user.slackWebhookUrl) {
        try {
          const slackPayload = {
            attachments: [
              {
                color: anomaly.severity === "HIGH" ? "#ef4444" : "#f59e0b",
                title: `🚨 ${anomaly.type} Alert - ${anomaly.severity} Severity`,
                text: anomaly.message,
                fields: [
                  {
                    title: "Status",
                    value: anomaly.severity,
                    short: true
                  },
                  {
                    title: "Time",
                    value: new Date().toLocaleString(),
                    short: true
                  }
                ],
                footer: "SentinelOps AI Monitor"
              }
            ]
          };
          await axios.post(user.slackWebhookUrl, slackPayload);
        } catch (err) {
          console.error("Slack alert failed:", err.message);
        }
      }

      // Send Discord Alert
      if (user.discordWebhookUrl) {
        try {
          const discordPayload = {
            embeds: [
              {
                title: `🚨 ${anomaly.type} Alert - ${anomaly.severity} Severity`,
                description: anomaly.message,
                color: anomaly.severity === "HIGH" ? 15685444 : 16097035, // Hex codes in decimal representation
                fields: [
                  {
                    name: "Severity",
                    value: anomaly.severity,
                    inline: true
                  },
                  {
                    name: "Timestamp",
                    value: new Date().toLocaleString(),
                    inline: true
                  }
                ],
                footer: {
                  text: "SentinelOps AI Monitoring Engine"
                }
              }
            ]
          };
          await axios.post(user.discordWebhookUrl, discordPayload);
        } catch (err) {
          console.error("Discord alert failed:", err.message);
        }
      }
    }
  } catch (error) {
    console.error("Notifier failed:", error.message);
  }
};

module.exports = { sendAlert };
