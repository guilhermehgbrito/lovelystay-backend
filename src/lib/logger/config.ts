import { z } from 'zod';

const logLevelSchema = z
  .enum(['error', 'warn', 'info', 'debug', 'silent'])
  .default('info');

export const logLevel = logLevelSchema.parse(process.env.LOG_LEVEL);
