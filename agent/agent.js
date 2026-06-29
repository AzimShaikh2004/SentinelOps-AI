try {
  require("dotenv").config();
} catch (e) {
  // dotenv not installed, fallback to process.env directly
}

const io = require(
  "socket.io-client"
);

const si = require(
  "systeminformation"
);

const os = require("os");

const socket = io(
  "http://localhost:5000",
  {
    auth: {
      apiKey: process.env.API_KEY || "sentinel_placeholder_key",
    },
  }
);


const sendMetrics =
  async () => {
    const cpu =
      await si.currentLoad();

    const memory =
      await si.mem();

    const network =
      await si.networkStats();

    socket.emit(
      "agent-metrics",
      
      {
        serverId:
          os.hostname(),

        cpu:
          cpu.currentLoad.toFixed(
            1
          ),

        memory:
          (
            (memory.used /
              memory.total) *
            100
          ).toFixed(1),

        download:
          (
            network[0].rx_sec /
            1024 /
            1024
          ).toFixed(2),

        upload:
          (
            network[0].tx_sec /
            1024 /
            1024
          ).toFixed(2),

        timestamp:
          new Date().toLocaleTimeString(),

        status:
  cpu.currentLoad > 80 ||
  (memory.used / memory.total) *
    100 >
    90
    ? "CRITICAL"
    : cpu.currentLoad > 50
    ? "WARNING"
    : "ONLINE",
      }
    );
  };

const { exec } = require("child_process");

socket.on("execute-command", (data) => {
  const { command, executionId } = data;
  if (!command) return;

  console.log(`[Agent] Executing command: "${command}" (ID: ${executionId})`);

  const child = exec(command, { timeout: 30000 });

  child.stdout.on("data", (chunk) => {
    socket.emit("command-output", { executionId, output: chunk, type: "stdout" });
  });

  child.stderr.on("data", (chunk) => {
    socket.emit("command-output", { executionId, output: chunk, type: "stderr" });
  });

  child.on("close", (code) => {
    socket.emit("command-close", { executionId, code });
  });

  child.on("error", (err) => {
    socket.emit("command-output", { executionId, output: `Process Error: ${err.message}\n`, type: "stderr" });
    socket.emit("command-close", { executionId, code: 1 });
  });
});

setInterval(sendMetrics, 3000);

console.log(
  "Monitoring agent started..."
);