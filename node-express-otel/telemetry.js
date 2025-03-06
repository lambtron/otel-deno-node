const process = require("process");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
const { OTLPTraceExporter } = require(
  "@opentelemetry/exporter-trace-otlp-http",
);
const { OTLPMetricExporter } = require(
  "@opentelemetry/exporter-metrics-otlp-http",
);
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");

// const { getNodeAutoInstrumentations } = require(
//   "@opentelemetry/auto-instrumentations-node",
// );

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
  logExporter: new OTLPLogExporter({
    url: "http://localhost:4318/v1/logs",
  }),
  metricExporter: new OTLPMetricExporter({
    url: "http://localhost:4318/v1/metrics",
  }),
  instrumentations: [
    new HttpInstrumentation(),
  ],
  // instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown()
    .then(() => console.log("Telemetry shutdown complete"))
    .finally(() => process.exit(0));
});
