const os = require("os");
const si = require("systeminformation");

const cpuAverage = () => {
  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  cpus.forEach((cpu) => {
    for (let type in cpu.times) {
      total += cpu.times[type];
    }

    idle += cpu.times.idle;
  });

  return {
    idle: idle / cpus.length,
    total: total / cpus.length,
  };
};

const getCPUUsage = () => {
  return new Promise((resolve) => {
    const startMeasure = cpuAverage();

    setTimeout(() => {
      const endMeasure = cpuAverage();

      const idleDifference = endMeasure.idle - startMeasure.idle;
      const totalDifference = endMeasure.total - startMeasure.total;

      const percentageCPU =
        totalDifference > 0
          ? 100 - Math.floor((100 * idleDifference) / totalDifference)
          : 0;

      resolve(percentageCPU);
    }, 100);
  });
};

const getRunningProcesses = async () => {
  try {
    const processesData = await si.processes();

    // Return top 10 processes sorted by CPU usage (descending)
    const topProcesses = processesData.list
      .filter((p) => p && (p.cpu > 0 || p.memRss > 0))
      .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
      .slice(0, 10)
      .map((process) => {
        let memoryValue = "0";
        if (process.memRss && process.memRss > 0) {
          memoryValue = (process.memRss / 1024 / 1024).toFixed(0);
        }

        return {
          pid: process.pid,
          name: process.name || "unknown",
          cpu: typeof process.cpu === "number" ? process.cpu.toFixed(1) : "0.0",
          memory: memoryValue,
        };
      });

    return topProcesses;
  } catch (err) {
    console.error("Process fetching error:", err.message);
    return [];
  }
};

const getDiskUsage = async () => {
  try {
    const disks = await si.fsSize();
    if (disks && disks.length > 0) {
      // Primary or largest filesystem
      const primary = disks.reduce((a, b) => ((a.size || 0) > (b.size || 0) ? a : b));
      const sizeGB = (primary.size / 1024 / 1024 / 1024).toFixed(2);
      const usedGB = (primary.used / 1024 / 1024 / 1024).toFixed(2);
      const freeGB = ((primary.size - primary.used) / 1024 / 1024 / 1024).toFixed(2);
      const usagePercent = typeof primary.use === "number" ? primary.use.toFixed(0) : "0";

      return {
        diskTotal: sizeGB,
        diskUsed: usedGB,
        diskFree: freeGB,
        diskUsagePercentage: usagePercent,
        diskMount: primary.mount || "/",
      };
    }
    return {
      diskTotal: "0",
      diskUsed: "0",
      diskFree: "0",
      diskUsagePercentage: "0",
      diskMount: "N/A",
    };
  } catch (err) {
    console.error("Disk monitoring error:", err.message);
    return {
      diskTotal: "0",
      diskUsed: "0",
      diskFree: "0",
      diskUsagePercentage: "0",
      diskMount: "N/A",
    };
  }
};

const getSystemMetrics = async () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const networkStats = await si.networkStats();
  const cpuUsage = await getCPUUsage();
  const runningProcesses = await getRunningProcesses();
  const diskInfo = await getDiskUsage();

  const rxSec = networkStats && networkStats[0] && networkStats[0].rx_sec ? networkStats[0].rx_sec : 0;
  const txSec = networkStats && networkStats[0] && networkStats[0].tx_sec ? networkStats[0].tx_sec : 0;

  return {
    processes: runningProcesses,
    downloadSpeed: (rxSec / 1024 / 1024).toFixed(2),
    uploadSpeed: (txSec / 1024 / 1024).toFixed(2),
    hostname: os.hostname(),
    platform: os.platform(),
    architecture: os.arch(),
    cpuCores: os.cpus().length,
    cpuUsage: `${cpuUsage}%`,
    totalMemory: (totalMemory / 1024 / 1024 / 1024).toFixed(2),
    freeMemory: (freeMemory / 1024 / 1024 / 1024).toFixed(2),
    usedMemory: (usedMemory / 1024 / 1024 / 1024).toFixed(2),
    memoryUsagePercentage: ((usedMemory / totalMemory) * 100).toFixed(0),
    uptime: (os.uptime() / 3600).toFixed(2),
    ...diskInfo,
  };
};

module.exports = {
  getSystemMetrics,
  getRunningProcesses,
  getDiskUsage,
};
