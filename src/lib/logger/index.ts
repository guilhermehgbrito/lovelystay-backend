import { createLogger, format, transports } from 'winston';
import { logLevel } from './config';

export const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.prettyPrint({ colorize: true }),
  ),
  transports: [new transports.Console()],
});

if (logLevel === 'silent') {
  logger.transports.forEach((transport) => {
    transport.silent = true;
  });
}
