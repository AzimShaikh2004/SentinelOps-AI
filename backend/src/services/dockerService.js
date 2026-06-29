const Docker = require("dockerode");

let docker;

try {
  const isWin = process.platform === "win32";
  docker = new Docker({
    socketPath: isWin ? "//./pipe/docker_engine" : "/var/run/docker.sock",
  });
} catch (error) {
  console.log(
    "Docker initialization failed"
  );
}


const calculateCPUPercentage = (
  stats
) => {
  try {
    const cpuDelta =
      stats.cpu_stats.cpu_usage
        .total_usage -
      stats.precpu_stats.cpu_usage
        .total_usage;

    const systemDelta =
      stats.cpu_stats.system_cpu_usage -
      stats.precpu_stats
        .system_cpu_usage;

    const cpuCount =
      stats.cpu_stats.online_cpus;

    if (
      systemDelta > 0 &&
      cpuDelta > 0
    ) {
      return (
        (
          (cpuDelta /
            systemDelta) *
          cpuCount *
          100
        ).toFixed(2)
      );
    }

    return "0.00";
  } catch {
    return "0.00";
  }
};

const getDockerContainers =
  async () => {
    try {
      if (!docker) return [];

      const containers =
        await docker.listContainers({
          all: true,
        });

      const detailedContainers =
        await Promise.all(
          containers.map(
            async (
              containerInfo
            ) => {
              try {
                const container =
                  docker.getContainer(
                    containerInfo.Id
                  );

                const stats =
                  await container.stats(
                    {
                      stream: false,
                    }
                  );

                const memoryMB =
stats.memory_stats &&
stats.memory_stats.usage
  ? (
      stats.memory_stats
        .usage /
      1024 /
      1024
    ).toFixed(0)
  : "0";

                const cpuUsage =
                  calculateCPUPercentage(
                    stats
                  );

                return {
                  id:
                    containerInfo.Id.substring(
                      0,
                      12
                    ),

                  name:
                    containerInfo.Names[0]?.replace(
                      "/",
                      ""
                    ) ||
                    "Unknown",

                  image:
                    containerInfo.Image,

                  state:
                    containerInfo.State,

                  status:
                    containerInfo.Status,

                  cpu:
                    `${cpuUsage}%`,

                  memory:
                    `${memoryMB} MB`,
                };
              } catch {
                return {
                  id:
                    containerInfo.Id.substring(
                      0,
                      12
                    ),

                  name:
                    containerInfo.Names[0]?.replace(
                      "/",
                      ""
                    ) ||
                    "Unknown",

                  image:
                    containerInfo.Image,

                  state:
                    containerInfo.State,

                  status:
                    containerInfo.Status,

                  cpu: "0%",

                  memory: "0 MB",
                };
              }
            }
          )
        );

      return detailedContainers;
    } catch (error) {
      console.log(
        "Docker Error:",
        error.message
      );

      return [];
    }
  };

const cleanDockerLogs = (buffer) => {
  const result = [];
  let offset = 0;
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;
    const type = buffer.readUInt8(offset); // 1 = stdout, 2 = stderr
    const length = buffer.readUInt32BE(offset + 4);
    offset += 8;
    if (offset + length <= buffer.length) {
      const chunk = buffer.toString("utf8", offset, offset + length);
      result.push(chunk);
    }
    offset += length;
  }
  return result.join("");
};

const getContainerLogs = async (containerId) => {
  try {
    if (!docker) return "Docker daemon is not connected.";
    const container = docker.getContainer(containerId);
    const logsBuffer = await container.logs({
      stdout: true,
      stderr: true,
      tail: 150,
      timestamps: true,
    });

    if (Buffer.isBuffer(logsBuffer)) {
      try {
        return cleanDockerLogs(logsBuffer);
      } catch (err) {
        return logsBuffer.toString("utf8");
      }
    }
    return logsBuffer.toString();
  } catch (error) {
    return `Error reading container logs: ${error.message}`;
  }
};

module.exports = {
  getDockerContainers,
  getContainerLogs,
};