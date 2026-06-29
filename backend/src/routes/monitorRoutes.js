const express = require("express");
const {
  getSystemHealth,
  startContainer,
  stopContainer,
  restartContainer,
  getContainerLogsRoute,
} = require("../controllers/monitorController");

const {
  getAutopilotStatus,
  getRecentEvents,
} = require("../controllers/autopilotController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/autopilot/status",
  protect,
  getAutopilotStatus
);

router.get(
  "/autopilot/events",
  protect,
  getRecentEvents
);

router.get(
  "/system",
  protect,
  getSystemHealth
);

router.post(
  "/containers/:id/start",
  protect,
  authorizeRoles("admin", "engineer"),
  startContainer
);

router.post(
  "/containers/:id/stop",
  protect,
  authorizeRoles("admin", "engineer"),
  stopContainer
);

router.post(
  "/containers/:id/restart",
  protect,
  authorizeRoles("admin", "engineer"),
  restartContainer
);

router.get(
  "/containers/:id/logs",
  protect,
  authorizeRoles("admin", "engineer"),
  getContainerLogsRoute
);

module.exports = router;