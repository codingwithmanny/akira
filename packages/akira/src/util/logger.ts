import winston from "winston";

const format = winston.format.combine(
  winston.format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
  winston.format.align(),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.prettyPrint(),
  winston.format.simple(),
  winston.format.splat(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
  )
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [new winston.transports.Console({ format })],
});
