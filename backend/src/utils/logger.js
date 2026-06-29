const logs = [];

const addLog = (
  type,
  message
) => {
  const log = {
    type,

    message,

    time:
      new Date().toLocaleTimeString(),
  };

  logs.unshift(log);

  if (logs.length > 50) {
    logs.pop();
  }
};

const getLogs = () => {
  return logs;
};

module.exports = {
  addLog,
  getLogs,
};