const Docker = require("dockerode");
const { getSystemMetrics } = require("../services/monitorService");

let docker;
try {
  const isWin = process.platform === "win32";
  docker = new Docker({
    socketPath: isWin ? "//./pipe/docker_engine" : "/var/run/docker.sock",
  });
} catch (error) {
  console.log("Docker initialization failed");
}


const { getContainerLogs } = require("../services/dockerService");

const getSystemHealth = async (req, res) => {
  try {
    const metrics = getSystemMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const startContainer = async (req, res) => {
  try {
    if (!docker) {
      return res.status(500).json({ message: "Docker daemon not available" });
    }
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.status(200).json({ message: "Container started successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const stopContainer = async (req, res) => {
  try {
    if (!docker) {
      return res.status(500).json({ message: "Docker daemon not available" });
    }
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.status(200).json({ message: "Container stopped successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restartContainer = async (req, res) => {
  try {
    if (!docker) {
      return res.status(500).json({ message: "Docker daemon not available" });
    }
    const container = docker.getContainer(req.params.id);
    await container.restart();
    res.status(200).json({ message: "Container restarted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContainerLogsRoute = async (req, res) => {
  try {
    const logs = await getContainerLogs(req.params.id);
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSystemHealth,
  startContainer,
  stopContainer,
  restartContainer,
  getContainerLogsRoute,
};