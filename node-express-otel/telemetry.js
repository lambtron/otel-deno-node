const process = require("process");
const { NodeSDK } = require("@opentelemetry/sdk-node");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");
const { OTLPTraceExporter } = require(
  "@opentelemetry/exporter-trace-otlp-http",
);
const { OTLPMetricExporter } = require(
  "@opentelemetry/exporter-metrics-otlp-http",
);
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
} = require("@opentelemetry/sdk-logs");
const { Resource } = require("@opentelemetry/resources");
const { trace, context } = require("@opentelemetry/api");

const resource = new Resource({
  "service.name": process.env.OTEL_SERVICE_NAME || "chat-app",
});

const logExporter = new OTLPLogExporter({
  url: "http://localhost:4318/v1/logs",
});

const loggerProvider = new LoggerProvider({
  resource, // ✅ Attach the resource with the updated attribute
});

loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));

const logger = loggerProvider.getLogger("chat-app-logger");

const customLogger = {
  info: (message, attributes = {}) => {
    const activeSpan = trace.getSpan(context.active());
    const traceId = activeSpan
      ? activeSpan.spanContext().traceId
      : "no-trace-id";
    logger.emit({
      traceId,
      body: message,
      severityText: "INFO",
      attributes,
    });
  },
  error: (message, attributes = {}) => {
    const activeSpan = trace.getSpan(context.active());
    const traceId = activeSpan
      ? activeSpan.spanContext().traceId
      : "no-trace-id";
    logger.emit({
      traceId,
      body: message,
      severityText: "ERROR",
      attributes,
    });
  },
};

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  }),
  metricExporter: new OTLPMetricExporter({
    url: "http://localhost:4318/v1/metrics",
  }),
  instrumentations: [
    new HttpInstrumentation(),
  ],
  logExporter,
  resource,
});

// Start the SDK and handle the promise properly
sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown()
    .then(() => logger.info("Telemetry shutdown complete"))
    .finally(() => process.exit(0));
});

module.exports = customLogger;
