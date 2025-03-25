import { z } from 'zod';

const dbConfigSchema = z.object({
  databaseUrl: z.string(),
});

export const dbConfig = dbConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
});
