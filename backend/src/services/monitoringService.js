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

      const idleDifference =
        endMeasure.idle - startMeasure.idle;

      const totalDifference =
        endMeasure.total - startMeasure.total;

      const percentageCPU =
        100 -
        Math.floor(
          (100 * idleDifference) /
            totalDifference
        );

      resolve(percentageCPU);
    }, 100);
  });
};

let previousMemoryValues = {};

const getRunningProcesses = async () => {
  const processesData = await si.processes();

  const importantProcesses =
    processesData.list
      .filter(
        (process) =>
          process.name
            .toLowerCase()
            .includes("chrome") ||

          process.name
            .toLowerCase()
            .includes("code") ||

          process.name
            .toLowerCase()
            .includes("node")
      )

      .slice(0, 10)

      .map((process) => {
        let memoryValue = "N/A";

        if (
          process.memRss &&
          process.memRss > 0
        ) {
          memoryValue = (
            process.memRss /
            1024 /
            1024
          ).toFixed(0);

          previousMemoryValues[
            process.pid
          ] = memoryValue;
        } else if (
          previousMemoryValues[
            process.pid
          ]
        ) {
          memoryValue =
            previousMemoryValues[
              process.pid
            ];
        }

        return {
          pid: process.pid,

          name: process.name,

          cpu: process.cpu.toFixed(1),

          memory: memoryValue,
        };
      });

  return importantProcesses;
};

const getSystemMetrics = async () => {
  const totalMemory = os.totalmem();

  const freeMemory = os.freemem();

  const networkStats =
    await si.networkStats();

  const usedMemory =
    totalMemory - freeMemory;

  const cpuUsage =
    await getCPUUsage();

  const runningProcesses =
    await getRunningProcesses();

  return {
    processes: runningProcesses,

    downloadSpeed: (
      networkStats[0].rx_sec /
      1024 /
      1024
    ).toFixed(2),

    uploadSpeed: (
      networkStats[0].tx_sec /
      1024 /
      1024
    ).toFixed(2),

    hostname: os.hostname(),

    platform: os.platform(),

    architecture: os.arch(),

    cpuCores: os.cpus().length,

    cpuUsage: `${cpuUsage}%`,

    totalMemory: (
      totalMemory /
      1024 /
      1024 /
      1024
    ).toFixed(2),

    freeMemory: (
      freeMemory /
      1024 /
      1024 /
      1024
    ).toFixed(2),

    usedMemory: (
      usedMemory /
      1024 /
      1024 /
      1024
    ).toFixed(2),

    memoryUsagePercentage: (
      (usedMemory / totalMemory) *
      100
    ).toFixed(0),

    uptime: (
      os.uptime() / 3600
    ).toFixed(2),
  };
};

module.exports = {
  getSystemMetrics,
  getRunningProcesses,
};