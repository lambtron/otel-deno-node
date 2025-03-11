import process from "process";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { Resource } from "@opentelemetry/resources";
import { context, trace } from "@opentelemetry/api";

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

export { customLogger as logger };
