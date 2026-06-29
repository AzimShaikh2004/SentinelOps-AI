const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const monitorRoutes = require("./routes/monitorRoutes");
const SystemMetric =
  require(
    "./models/SystemMetric"
  );
const ApiKey = require("./models/ApiKey");
let lastMetricSave = 0;  


const {
  addLog,
  getLogs,
} = require("./utils/logger");

const {
  detectAnomalies,
} = require(
  "./utils/anomalyDetector"
);

const {
  getDockerContainers,
} = require(
  "./services/dockerService"
);

const {
  getSystemMetrics,
} = require(
  "./services/monitoringService"
);

const {
  analyzeMetrics,
} = require(
  "./utils/aiAnalyzer"
);

const {
  forecastSeries,
} = require(
  "./utils/forecaster"
);

const {
  toggleAutopilot,
  runSelfHealingLoop,
} = require(
  "./controllers/autopilotController"
);

const Incident = require(
  "./models/Incident"
);
const { sendAlert } = require("./utils/notifier");


const incidentRoutes =
  require(
    "./routes/incidentRoutes"
  );

const metricsRoutes =
  require(
    "./routes/metricsRoutes"
  );

const reportRoutes =
  require(
    "./routes/reportRoutes"
  );  




connectDB();

const app = express();

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const apiKey = socket.handshake.auth?.apiKey || socket.handshake.query?.apiKey;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.clientType = "dashboard";
      return next();
    } else if (apiKey) {
      const keyRecord = await ApiKey.findOne({ key: apiKey });
      if (!keyRecord) {
        return next(new Error("Authentication error: Invalid Agent API Key"));
      }
      socket.apiKey = apiKey;
      socket.clientType = "agent";
      return next();
    } else {
      return next(new Error("Authentication error: No credentials provided"));
    }
  } catch (err) {
    return next(new Error("Authentication error: Invalid credentials"));
  }
});


app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/protected",
  protectedRoutes
);

app.use(
  "/api/monitor",
  monitorRoutes
);

app.use(
  "/api/incidents",
  incidentRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/metrics",
  metricsRoutes
);

app.get("/", (req, res) => {
  res.json({
    message:
      "SentinelOps AI Backend Running Successfully",
  });
});

let connectedServers = [];
let latestMetrics = null;
let latestContainers = [];
let latestAnomalies = [];
let latestAiAnalysis = null;
let latestLogs = [];

const pollSystemMetrics = async () => {
  try {
    const metrics = await getSystemMetrics();
    const containers = await getDockerContainers();
    const anomalies = await detectAnomalies(metrics);
    const aiAnalysis = await analyzeMetrics(metrics, anomalies);

    // Compute statistical forecasting trends for CPU and Memory
    let cpuForecast = [];
    let memForecast = [];
    try {
      const history = await SystemMetric.find().sort({ createdAt: -1 }).limit(20);
      const cpuHistory = history.map(h => h.cpuUsage).filter(x => x !== undefined && !isNaN(x)).reverse();
      const memHistory = history.map(h => h.memoryUsage).filter(x => x !== undefined && !isNaN(x)).reverse();
      
      // Seed predictions with the current system state
      cpuHistory.push(parseFloat(metrics.cpuUsage));
      memHistory.push(parseFloat(metrics.memoryUsagePercentage));

      cpuForecast = forecastSeries(cpuHistory, 5);
      memForecast = forecastSeries(memHistory, 5);
    } catch (forecastErr) {
      console.error("[Forecaster] Failed to compute trends:", forecastErr.message);
    }

    latestMetrics = {
      ...metrics,
      cpuForecast,
      memForecast
    };
    latestContainers = containers;
    latestAnomalies = anomalies;
    latestAiAnalysis = aiAnalysis;
    latestLogs = getLogs();

    io.to("dashboard-clients").emit("system-metrics", latestMetrics);
    io.to("dashboard-clients").emit("ai-analysis", latestAiAnalysis);
    io.to("dashboard-clients").emit("docker-containers", latestContainers);
    io.to("dashboard-clients").emit("system-anomalies", latestAnomalies);
    io.to("dashboard-clients").emit("system-logs", latestLogs);

    const now = Date.now();
    if (now - lastMetricSave > 60000) {
      lastMetricSave = now;
      try {
        await SystemMetric.create({
          cpuUsage: parseFloat(metrics.cpuUsage),
          memoryUsage: parseFloat(metrics.memoryUsagePercentage),
          freeMemory: parseFloat(metrics.freeMemory),
          cpuCores: metrics.cpuCores,
          downloadSpeed: parseFloat(metrics.downloadSpeed),
          uploadSpeed: parseFloat(metrics.uploadSpeed),
          hostname: metrics.hostname,
          uptime: metrics.uptime,
        });
        addLog("INFO", "Historical metric saved");
      } catch (error) {
        console.error("Metric save error:", error.message);
      }
    }

    if (anomalies.length > 0) {
      // Trigger Autopilot Self-Healing loop if enabled
      runSelfHealingLoop(io, anomalies[0], metrics.hostname);

      for (const anomaly of anomalies) {
        addLog("WARNING", anomaly.message);
        const recentIncident = await Incident.findOne({
          message: anomaly.message,
          createdAt: {
            $gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        });

        if (!recentIncident) {
          await Incident.create({
            type: anomaly.type,
            severity: anomaly.severity,
            message: anomaly.message,
          });
          sendAlert(anomaly);
        }

      }
    }
  } catch (error) {
    console.error("Global metrics polling error:", error.message);
  }
};

// Start global telemetry polling singleton
setInterval(pollSystemMetrics, 3000);

// Global offline server check
setInterval(async () => {
  const now = Date.now();

  for (let i = 0; i < connectedServers.length; i++) {
    const serverData = connectedServers[i];
    const lastSeen = serverData.lastSeen || now;

    if (now - lastSeen > 10000 && serverData.status !== "OFFLINE") {
      connectedServers[i] = {
        ...serverData,
        status: "OFFLINE",
      };

      const exists = await Incident.findOne({
        message: `${serverData.serverId} went OFFLINE`,
      });

      if (!exists) {
        await Incident.create({
          type: "SERVER_OFFLINE",
          severity: "HIGH",
          server: serverData.serverId,
          message: `${serverData.serverId} went OFFLINE`,
        });

        addLog("CRITICAL", `${serverData.serverId} went OFFLINE`);
      }
    }
  }

  io.to("dashboard-clients").emit("multi-server-data", connectedServers);
}, 5000);

io.on("connection", (socket) => {
  console.log(
    `New client connected: ${socket.id} (${socket.clientType})`
  );

  addLog(
    "SOCKET",
    `Client connected: ${socket.id} (${socket.clientType})`
  );

  if (socket.clientType === "dashboard") {
    socket.join("dashboard-clients");

    // Push initial cached stats immediately so client doesn't wait
    if (latestMetrics) {
      socket.emit("system-metrics", latestMetrics);
      socket.emit("ai-analysis", latestAiAnalysis);
      socket.emit("docker-containers", latestContainers);
      socket.emit("system-anomalies", latestAnomalies);
      socket.emit("system-logs", latestLogs);
    }
    socket.emit("multi-server-data", connectedServers);
    socket.emit("autopilot-status", { enabled: toggleAutopilot(undefined) || false });
  }

  socket.on("toggle-autopilot", (data) => {
    if (socket.clientType !== "dashboard") return;
    const isEnabled = toggleAutopilot(data.enabled);
    io.to("dashboard-clients").emit("autopilot-status", { enabled: isEnabled });
  });

  socket.on("execute-command", async (data) => {
    if (socket.clientType !== "dashboard") return;

    // Verify role permissions
    if (!socket.user || !["admin", "engineer"].includes(socket.user.role)) {
      socket.emit("command-error", { 
        executionId: data.executionId, 
        error: "Unauthorized: Only users with admin or engineer roles can execute diagnostic commands." 
      });
      return;
    }

    const { command, serverId, executionId } = data;
    const sockets = await io.fetchSockets();
    const agentSocket = sockets.find(s => s.clientType === "agent" && s.serverId === serverId);

    if (!agentSocket) {
      socket.emit("command-error", { 
        executionId, 
        error: `Agent connection for target server "${serverId}" is offline.` 
      });
      return;
    }

    console.log(`[Server] Routing execution request "${command}" to Agent ${agentSocket.id}`);
    agentSocket.emit("execute-command", { command, executionId });

    const onOutput = (out) => {
      if (out.executionId === executionId) {
        socket.emit("command-output", out);
      }
    };

    const onClose = (close) => {
      if (close.executionId === executionId) {
        socket.emit("command-close", close);
        agentSocket.off("command-output", onOutput);
        agentSocket.off("command-close", onClose);
      }
    };

    agentSocket.on("command-output", onOutput);
    agentSocket.on("command-close", onClose);
  });

  socket.on(
    "agent-metrics",
    (data) => {
      if (socket.clientType !== "agent") {
        console.log(`Unauthorized metrics submission from client ${socket.id}`);
        return;
      }
      
      socket.serverId = data.serverId; // Map server ID to agent socket

      const existingServer =
        connectedServers.find(
          (server) =>
            server.serverId ===
            data.serverId
        );

      if (existingServer) {
        Object.assign(
          existingServer,
          {
            ...data,
            status: "ONLINE",
            lastSeen: Date.now(),
          }
        );
      } else {
        connectedServers.push({
          ...data,
          status: "ONLINE",
          lastSeen: Date.now(),
        });
      }

      io.to("dashboard-clients").emit(
        "multi-server-data",
        connectedServers
      );
    }
  );

  socket.on(
    "disconnect",
    () => {
      console.log(
        `Client disconnected: ${socket.id}`
      );

      addLog(
        "SOCKET",
        `Client disconnected: ${socket.id}`
      );
    }
  );
});

const PORT =

  process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );

  addLog(
    "INFO",
    `Server started on port ${PORT}`
  );
});

// Trigger restart