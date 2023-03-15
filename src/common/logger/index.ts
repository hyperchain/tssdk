import { createLogger, format, Logger, LoggerOptions, transports } from "winston";
import "winston-daily-rotate-file";
import { JSONBigintUtil } from "..";
import { isInNode } from "../util/env";

// 新建 logger（默认配置）
function newLogger(options?: LoggerOptions): Logger {
  if (options != null) {
    return createLogger(options);
  }

  const logger = createLogger({
    level: "info",
    format: format.combine(
      format.colorize(),
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.splat(),
      format.errors({ stack: true }),
      format.printf(({ level, timestamp, message }) => {
        return `[${level}][${timestamp}]: ${
          typeof message === "string" ? message : JSONBigintUtil.stringify(message)
        }`;
      })
    ),
  });

  // DailyRotateFile is only supported for node
  if (isInNode()) {
    const auditFileName = "./logs/hash-audit.json";
    const transport = new transports.DailyRotateFile({
      auditFile: auditFileName.toString(),
      filename: "./logs/%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    });
    logger.add(transport);
    logger.defaultMeta = {
      nodeAuditFile: auditFileName.toString(),
    };
  }

  // If we're not in production then **ALSO** log to the `console` with the colorized simple format.
  if (process.env.NODE_ENV !== "production") {
    logger.add(new transports.Console());
  }

  return logger;
}

let logger = newLogger();

function resetLogger(options?: LoggerOptions) {
  logger = newLogger(options);
  return logger;
}

export { logger, resetLogger, newLogger };
