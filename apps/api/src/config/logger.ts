import winston from 'winston';
import morgan from 'morgan';
import path from 'path';

// Define log directory
// Define log directory
// CWD is apps/api, so ../../logs points to root/logs
const logDir = path.join(process.cwd(), '../../logs');

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create Winston Logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console Transport (for development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    // File Transport (Error logs)
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // File Transport (Combined logs)
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

// Create Morgan Stream config to pipe logs to Winston
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Morgan Middleware
export const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream: morganStream }
);
