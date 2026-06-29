const os = require("os");

const getSystemMetrics = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  const usedMemory = totalMemory - freeMemory;

  return {
    hostname: os.hostname(),

    platform: os.platform(),

    architecture: os.arch(),

    cpuCores: os.cpus().length,

    totalMemory: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,

    freeMemory: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,

    usedMemory: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,

    uptime: `${(os.uptime() / 60 / 60).toFixed(2)} hours`,
  };
};

module.exports = {
  getSystemMetrics,
};