const http = require("http");

// Simple function to send log messages to the OTel Collector
function sendLog(message) {
  const data = JSON.stringify({
    resourceLogs: [{
      scopeLogs: [{
        logRecords: [{
          body: { stringValue: message },
          severityText: "INFO",
          timeUnixNano: `${Date.now() * 1_000_000}`, // nanoseconds
        }],
      }],
    }],
  });

  http.request({
    hostname: "localhost", // Use 'host.docker.internal' in Docker
    port: 4318,
    path: "/v1/logs",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  }).end(data);
}

// Override console.log globally with minimal setup
const originalConsoleLog = console.log;
console.log = (message, ...args) => {
  originalConsoleLog(message, ...args); // Keep normal console output
  sendLog(typeof message === "string" ? message : JSON.stringify(message)); // Send to OTel
};

// Example usage
console.log("Hello from my app!");
