import winston, { createLogger, format, transports } from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

let loggerOptions: winston.LoggerOptions = {};

if (process.env.NODE_ENV === 'production') {
  const gcpTransport = new LoggingWinston({ prefix: 'TANUKI' });
  loggerOptions = {
    transports: [gcpTransport],
    exceptionHandlers: [gcpTransport],
  };
} else {
  const myFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(info => {
      const { timestamp, level, message, ...args } = info;

      const ts = timestamp.slice(0, 19).replace('T', ' ');
      return `${ts}-[TANUKI]-[${level}]: ${message} ${
        Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
      }`;
    })
  );
  loggerOptions = {
    transports: [new transports.Console({ format: myFormat })],
  };
}

const logger = createLogger({
  level: 'info',
  ...loggerOptions,
});

export default logger;
